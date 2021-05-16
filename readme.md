### :warning: this app in currently in beta and does not fully support Bi-sync classes (they may work though)
# SFSU Auto Scheduler
This is a multi-platform web extension that allows students at San Francisco State University to easily figure out what is the best class to pick.

## Problem

In the second semester as a computer science student at SFSU you need to take the following courses
CSC 220, MATH 227, PHYS 220, PHYS 222, Area A, Area E

After you search for these courses you will be presented with 50-100 classes depending on what GEs you pick, and it is very difficult to figure out which times works best for you and which teachers are good or not

Here is an example of what I did before I made this extension
![Spreadsheet of classes](https://raw.githubusercontent.com/Cpaczek/SFSU-Auto-Scheduler/master/readme/1132ef46e379832016ec17d00a515278.png)
This had all the classes that I considered acceptable. My criteria was that they should have a ratemyprofessor score >= 3 and not have a class that was too early after I filtered the list it left me with ~30 classes to figure out how to put it together.
This process overall takes about 1-3 hours depending on the complexity of your classes and you are still not able to be confident that you made the best schedule for you self.

## Solution
First install the chrome extension via the instruction below (coming to chrome webstore soon)

Next go to https://www.sfsu.edu/online/clssch.htm and type in that course that you need to take, for example CSC 413
After the search is complete you will be greeted with a new button added by the extension
![Course Lookup](https://raw.githubusercontent.com/Cpaczek/SFSU-Auto-Scheduler/master/readme/f309a7ebc954ee8afa222dfcb5248690.png)
Simply click the button to add the class to the extension.
**You are unable to remove classes from this screen if you added a class on accident you need to do this from the scheduling page by clicking on the extension icon.** 
After you have done this with all of your courses click the extension icon in the upper right and click "Go To Scheduler"
![Extension popup](https://raw.githubusercontent.com/Cpaczek/SFSU-Auto-Scheduler/master/readme/5c2d36da09b5f54ae397993af0629a59.png)
From here you can view all of the classes that you selected and whether you want to prioitize the RMP Score or Having afternoon classes
**In the event of a tie (i.e 2 professors have a score of 4) the algo will select the class that occurs later in the day**
Options to prioritize early morning classes is coming soon.
After you generate your schedule you will get 5 optimal schedules that you can choose from.
![Generated Schedule](https://raw.githubusercontent.com/Cpaczek/SFSU-Auto-Scheduler/master/readme/009377f25d2e5bfd5733a63ecf4b3506.png)

# Todo
- [ ] Add support for Bi-sync classes (this may work already)
- [x] Add support for Async classes
- [x] Add support to prioritize early classes
- [ ] Restyle UI
- [ ] Take an algorithms class and figure out how to increase efficiency of scheduling algorithm (nope)

# Build/Run Instructions
## Build Instructions
1. `npm install`
2. `npm run build`

## Run Instructions
1. go to `chrome://extensions` in chrome
2. Enable developer mode in the upper right-hand corner
3. In the  upper left-hand corner click the `load unpacked` button
4. Navigate to the `dist` folder that was created after you built this project
5. Your now have a working extension
6. Now go to the course lookup and search for a class https://webapps.sfsu.edu/public/classservices/classsearch 
7. Currently Async and Bisync classes are not supported and may cause unpredictable behaviour
