from boggle import Boggle
from flask import Flask, render_template, session, request, redirect, jsonify
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
# the toolbar is only enabled in debug mode:
app.debug = True

# set a 'SECRET_KEY' to enable the Flask session cookies
app.config['SECRET_KEY'] = 'abc123'
toolbar = DebugToolbarExtension(app)

boggle_game = Boggle()


@app.route("/")
def show_home():
    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get("highscore", 0)
    # num_plays = session.get("num_plays", 0)
    return render_template('index.html',
                           board=board,
                           #    num_plays=num_plays,
                           highscore=highscore)


@app.route("/check-answer")
def check_answer():
    word = request.args['word']
    board = session['board']
    answer = boggle_game.check_valid_word(board, word)
    # print('answer', answer)
    return jsonify({"result": answer})


@app.route("/get-score", methods=["POST"])
def get_score():
    score = request.json["score"]  # <-- ASK TA ABOUT THIS
    # print('score', score)
    highscore = session.get('highscore', 0)
    # num_plays = session.get('num_plays', 0)
    # session['num_plays'] = num_plays + 1
    session['highscore'] = max(score, highscore)
    return jsonify(topScore=score > highscore)
