from multiprocessing import Process, Queue
from flask import Flask, render_template, request, jsonify
from motor import initServo, moveServo
from queue_manager import init_queue

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('diagram.html')

@app.route('/user/<username>')
def show_user_profile(username):
    return f'User {username}'

@app.route('/send_data', methods=['POST'])
def send_data():
    if request.is_json:
        data = request.get_json()
        command = data.get('command')
        if command == "init":
            return handleInit(data)
        elif command == "servo":
            return handleServo(data)
        elif command == "status":
            return handleStatus(data)
    else:
        return jsonify({"message": "Request must be JSON.", "status": "error"}), 400


@app.route('/get_data', methods=['GET'])
def get_data():
    # Simulate fetching some data
    data_to_send = {
        "product_name": "Example Widget",
        "price": 29.99,
        "available": True,
        "features": ["lightweight", "durable", "portable"]
    }
    return jsonify(data_to_send), 200

def handleInit(data):
    initServo()

    name = data.get('name')
    age = data.get('age')

    if name and age:
        print(f"Received data from frontend: Name={name}, Age={age}")
        response_message = f"Hello, {name}! You are {age} years old. Data received successfully."
        return jsonify({"message": response_message, "status": "success"}), 200
    else:
        return jsonify({"message": "Name and age are required.", "status": "error"}), 400

def handleServo(data):
    channel = data.get('channel')
    value   = data.get('value') 
    print(f"move servo: channel:{channel} value:{value}")
    moveServo(channel, value)

    response_message = f"Data received. channel:{channel} value:{value}"
    return jsonify({"message": response_message, "status": "success"}), 200

def handleStatus(data):
    if queue.empty():
        queue_data = None
    else:
        queue_data = queue.get()
        
    return jsonify({"status": "success", "queue": queue_data}), 200

if __name__ == '__main__':    
    queue = init_queue()

    app.run(debug=True, host='0.0.0.0', port=5000)