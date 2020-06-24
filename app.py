from boggle import Boggle
from flask import Flask, render_template, session, request, jsonify

app = Flask(__name__)

# set a 'SECRET_KEY' to enable the Flask session cookies
app.config['SECRET_KEY'] = 'abc123'

# runs the method from Boggle import
boggle_game = Boggle()


@app.route("/")
def show_home():
    """renders homepage template and starts session"""
    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get("highscore", 0)
    return render_template('index.html',
                           board=board,
                           highscore=highscore)


@app.route("/check-answer")
def check_answer():
    """gets words from form and send to server as json"""
    word = request.args['word']
    board = session['board']
    """checks validity of word"""
    answer = boggle_game.check_valid_word(board, word)
    return jsonify({'result': answer})


@app.route("/get-score", methods=["POST"])
def get_score():
    """returns score value from server as json"""
    score = int(request.json["score"])
    highscore = session.get('highscore', 0)
    """posts score or highest score"""
    session['highscore'] = max(score, highscore)
    return jsonify(topScore=score > highscore)
