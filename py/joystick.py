import pygame

# Initialize pygame
pygame.init()

# Get the number of joysticks
joystick_count = pygame.joystick.get_count()
if joystick_count == 0:
    print("No joystick detected.")
    exit()
else:
    print(f"{joystick_count} joystick(s) found.")

# Initialize the first joystick
joystick = pygame.joystick.Joystick(0)
joystick.init()

print(f"Joystick name: {joystick.get_name()}")
print(f"Number of buttons: {joystick.get_numbuttons()}")
print(f"Number of axes: {joystick.get_numaxes()}")
print(f"Number of hats: {joystick.get_numhats()}")

# Main event loop
running = True
while running:
    # Get all events from the event queue
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        
        # Check for joystick events
        if event.type == pygame.JOYBUTTONDOWN:
            print(f"Button {event.button} pressed.")
        elif event.type == pygame.JOYBUTTONUP:
            print(f"Button {event.button} released.")
        elif event.type == pygame.JOYAXISMOTION:
            # event.axis is the axis index, event.value is the position
            print(f"Axis {event.axis} moved to {event.value:.2f}.")
        elif event.type == pygame.JOYHATMOTION:
            # event.hat is the hat index, event.value is a tuple (x, y)
            print(f"Hat {event.hat} moved to {event.value}.")

# Quit pygame
pygame.quit()