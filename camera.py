import cv2

# Open a connection to the webcam
cap = cv2.VideoCapture(0)

# Check if the webcam is opened correctly
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print("Press 's' to save an image, 'q' to quit.")

while True:
    # Read a frame from the webcam
    ret, frame = cap.read()

    # If the frame was not read successfully, break the loop
    if not ret:
        print("Error: Could not read frame.")
        continue
        # break

    # Display the current frame
    cv2.imshow('Webcam Feed', frame)