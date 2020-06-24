from unittest import TestCase
from app import app
from boggle import Boggle
from flask import session


class BoggleTestCase(TestCase):
    """unit tests for boggle app"""

    def setUp(self):
        """To do before every test runs"""
        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_show_home(self):
        """test the homepage route"""
        with self.client:
            response = self.client.get("/")
            html = response.get_data(as_text=True)
            """check to see if html returns"""
            self.assertIn("board", session)
            self.assertIsNone(session.get('highscore'))
            self.assertIn('<h1 class="title">Boggle Game</h1>', html)
            self.assertIn('<p>Time Left:', html)
            self.assertEqual(response.status_code, 200)

    def test_check_answer(self):
        """test the check-answer route"""
        with self.client as client:
            """checks if the word exists on the board"""
            with client.session_transaction() as board_sess:
                board_sess['board'] = [['B', 'O', 'A', 'T', 'T'],
                                       ['B', 'O', 'A', 'T', 'T'],
                                       ['B', 'O', 'A', 'T', 'T'],
                                       ['B', 'O', 'A', 'T', 'T'],
                                       ['B', 'O', 'A', 'T', 'T']]
            response = self.client.get("/check-answer?word=boat")
            self.assertEqual(response.json['result'], 'ok')

    def test_invalid_word(self):
        """test for invalid word"""
        self.client.get('/')
        """checks if word is on board or is a word"""
        response = self.client.get('/check-answer?word=difficult')
        self.assertEqual(response.json['result'], 'not-on-board')
        response = self.client.get('/check-answer?word=tttt')
        self.assertEqual(response.json['result'], 'not-word')

    def test_non_english_word(self):
        """test for valid English word"""
        self.client.get('/')
        response = self.client.get('/check-answer?word=dlfjhsaljfhk')
        self.assertEqual(response.json['result'], 'not-word')
