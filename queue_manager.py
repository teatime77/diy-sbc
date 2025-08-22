import sys
import multiprocessing.managers
import time

PORT = 5432

# Define a custom manager that exposes the queue
class QueueManager(multiprocessing.managers.BaseManager):
    pass

def run_manager():

    # Create a queue that will be shared
    q = multiprocessing.Queue()

    # Register the queue with the manager so it can be accessed
    QueueManager.register('get_queue', callable=lambda: q)

    # Start the manager server
    m = QueueManager(address=('', PORT), authkey=b'mysecretkey')
    s = m.get_server()
    print("Starting queue server...")
    s.serve_forever()

def init_queue():
    # Register the same queue
    QueueManager.register('get_queue')

    # Connect to the server
    print("Connecting to the queue server...")
    m = QueueManager(address=('', PORT), authkey=b'mysecretkey')
    m.connect()

    # Get the queue from the manager
    queue = m.get_queue()

    return queue

if __name__ == '__main__':
    run_manager()
