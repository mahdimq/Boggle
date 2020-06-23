from unittest import TestCase
from app import app
from boggle import Boggle
from flask import session


class BoggleTestCase(TestCase):
    """unit tests for boggle app"""

    def setUp(self):
        self.client = app.test_client()
        app.config['TESTING'] = True
        app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']

    def test_show_home(self):
        with self.client:
            response = self.client.get("/")
            html = response.get_data(as_text=True)
            self.assertIn('<h1 class="title">Boggle Game</h1>', html)
            self.assertIn(
                '<p>Time Left: <span id="timer">10</span></p>', response.data)
            self.assertEqual(response.status_code, 200)

    def test_check_answer(self):
        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [['B', 'O', 'A', 'T', 'T'],
                                 ['B', 'O', 'A', 'T', 'T'],
                                 ['B', 'O', 'A', 'T', 'T'],
                                 ['B', 'O', 'A', 'T', 'T'],
                                 ['B', 'O', 'A', 'T', 'T']]
                response = self.client.get("/check-answer?word=boat")
                self.assertEqual(response.json['result'], 'ok')

    def test_invalid_word(self):
        # self.client.get('/')
        response = self.client.get('/check-word?word=difficult')
        self.assertEqual(response.json['result'], 'not-on-board')
        response = self.client.get('/check-word?word=tttt')
        self.assertEqual(response.json['result'], 'not-word')

    def non_english_word(self):
        self.client.get('/')
        response = self.client.get('/check-word?word=dlfjhsaljfhk')
        self.assertEqual(response.json['result'], 'not-word')
