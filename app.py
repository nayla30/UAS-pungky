from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///zakat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Pembayar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    datePaid = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text, default='')

@app.route('/')
def index():
    pembayars = Pembayar.query.all()
    return render_template('index.html', pembayars=pembayars)

@app.route('/api/pembayar', methods=['POST'])
def add_pembayar():
    data = request.json
    pembayar = Pembayar(
        name=data['name'],
        amount=data['amount'],
        datePaid=datetime.strptime(data['datePaid'], '%Y-%m-%d'),
        notes=data.get('notes', '')
    )
    db.session.add(pembayar)
    db.session.commit()
    return jsonify({'message': 'Pembayar berhasil ditambahkan'}), 201

@app.route('/api/pembayar/<int:id>', methods=['PUT'])
def update_pembayar(id):
    pembayar = Pembayar.query.get_or_404(id)
    data = request.json
    print('Data received for update:', data)  # Debug log
    pembayar.name = data['name']
    pembayar.amount = data['amount']
    pembayar.datePaid = datetime.strptime(data['datePaid'], '%Y-%m-%d')
    pembayar.notes = data.get('notes', '')
    db.session.commit()
    return jsonify({'message': 'Pembayar berhasil diperbarui'})

@app.route('/api/pembayar/<int:id>', methods=['DELETE'])
def delete_pembayar(id):
    pembayar = Pembayar.query.get_or_404(id)
    db.session.delete(pembayar)
    db.session.commit()
    return jsonify({'message': 'Pembayar berhasil dihapus'})

@app.route('/api/pembayar/<int:id>', methods=['GET'])
def get_pembayar(id):
    pembayar = Pembayar.query.get_or_404(id)
    return jsonify({
        'id': pembayar.id,
        'name': pembayar.name,
        'amount': pembayar.amount,
        'datePaid': pembayar.datePaid.strftime('%Y-%m-%d'),
        'notes': pembayar.notes
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)