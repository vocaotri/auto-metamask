import os
import pyautogui
import sys
ROOT_PATH = os.path.abspath(os.curdir)
while True:
    location = pyautogui.locateOnScreen(ROOT_PATH + "/resource/images/accept.png")
    if(location):
        pyautogui.click(location)
        print ("success")
        sys.exit()

