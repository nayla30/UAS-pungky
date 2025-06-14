from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///zakatpay.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Payer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    pay_date = db.Column(db.Date, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'amount': self.amount,
            'pay_date': self.pay_date.strftime('%Y-%m-%d')
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/payers', methods=['GET'])
def get_payers():
    payers = Payer.query.order_by(Payer.pay_date.desc()).all()
    return jsonify([p.to_dict() for p in payers])

@app.route('/api/payers', methods=['POST'])
def add_payer():
    data = request.json
    name = data.get('name', '').strip()
    amount = data.get('amount')
    pay_date = data.get('pay_date')
    if not name or len(name) < 2 or not amount or int(amount) <= 0 or not pay_date:
        return jsonify({'error': 'Data tidak valid.'}), 400
    payer = Payer(name=name, amount=int(amount), pay_date=datetime.strptime(pay_date, '%Y-%m-%d'))
    db.session.add(payer)
    db.session.commit()
    return jsonify(payer.to_dict()), 201

@app.route('/api/payers/<int:payer_id>', methods=['PUT'])
def update_payer(payer_id):
    payer = Payer.query.get_or_404(payer_id)
    data = request.json
    name = data.get('name', '').strip()
    amount = data.get('amount')
    pay_date = data.get('pay_date')
    if not name or len(name) < 2 or not amount or int(amount) <= 0 or not pay_date:
        return jsonify({'error': 'Data tidak valid.'}), 400
    payer.name = name
    payer.amount = int(amount)
    payer.pay_date = datetime.strptime(pay_date, '%Y-%m-%d')
    db.session.commit()
    return jsonify(payer.to_dict())

@app.route('/api/payers/<int:payer_id>', methods=['DELETE'])
def delete_payer(payer_id):
    payer = Payer.query.get_or_404(payer_id)
    db.session.delete(payer)
    db.session.commit()
    return jsonify({'result': True})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
