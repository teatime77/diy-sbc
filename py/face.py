from multiprocessing import Queue
import cv2
from picamera2 import Picamera2
from PIL import Image
from queue_manager import init_queue

def detect_face():
    queue = init_queue()

    # Initialize the Picamera2 object
    picam2 = Picamera2()

    # Configure the camera to capture a preview stream
    # "RGB888" is a good format for direct use with OpenCV
    picam2.configure(picam2.create_preview_configuration(main={"format": 'RGB888', "size": (640, 480)}))

    # Start the camera stream
    picam2.start()

    # Load the Haar Cascade classifier for face detection
    face_cascade = cv2.CascadeClassifier('data/haarcascade_frontalface_default.xml')

    idx = 0
    while True:

        # Capture a frame as a NumPy array
        frame = picam2.capture_array()

        rgb_array = frame[:, :, ::-1]
        image_pil = Image.fromarray(rgb_array, 'RGB')
        image_file_name = f"image-{idx}.png"
        image_pil.save(f"static/lib/diagram/img/{image_file_name}")

        # Convert the frame to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        # Draw rectangles around detected faces
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

        # Display the frame with the rectangles
        cv2.imshow('Face Detection', frame)
        
        # Break the loop if the 'q' key is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        data_to_send = {
            "idx" : idx,
            "image_file_name": image_file_name
        }
        queue.put(data_to_send)

        idx += 1

    # Clean up
    cv2.destroyAllWindows()
    picam2.stop()

if __name__ == "__main__":
    detect_face()
