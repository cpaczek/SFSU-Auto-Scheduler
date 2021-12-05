<template>
  <div>
    <h1 v-if="courseNames.length !== 0">Selected Classes</h1>
    <h1 v-else>You have no selected classes Navigate to <a
        href="https://webapps.sfsu.edu/public/classservices/classsearch">here</a> and search for your class</h1>
    <div v-if="courseNames.length !== 0">

      <div class="col">
        <div class="tabs">
          <div v-for="(classes1, key) in sortedClasses" :key="classes1.name" class="tab">
            <input :id="key" type="checkbox">
            <label :for="key" class="tab-label">{{ key }}</label>
            <div class="tab-content">
              <table>
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Professor</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>Days</th>
                  <th>Remove</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="classes2 in classes1" :key="classes2.name">
                  <td>{{ classes2.name }}</td>
                  <td>{{ classes2.prof }}</td>
                  <td>{{
                      getRMPScore(classes2.prof.substr(0, classes2.prof.indexOf(' ')), classes2.prof.substr(classes2.prof.indexOf(' ') + 1))
                    }}
                  </td>
                  <td>{{ classes2.time }}</td>
                  <td>{{ classes2.days }}</td>
                  <td>
                    <button class="button-danger" @click="removeClass(classes2.name)">Remove</button>
                  </td>
                </tr>
                </tbody>
                <br>
                <br>
                <br>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <br>
    <br>
    <br>
    <!--    left is false right is true-->
    <div v-if="courseNames.length !== 0">
      <p>I prefer to have</p><br>
      <div class="container">
        <form>
          <label>
            <input v-model="classTimePreference" name="radio" type="radio" value="true"/>
            <span>Morning Classes</span>
          </label>
          <label>
            <input v-model="classTimePreference" name="radio" type="radio" value="false"/>
            <span>Afternoon Classes</span>
          </label>
        </form>
        <p>Give Priority to Rate My Professor Score</p>
        <form>
          <label>
            <input v-model="rmpPreference" name="radio" type="radio" value="true"/>
            <span>Yes</span>
          </label>
          <label>
            <input v-model="rmpPreference" name="radio" type="radio" value="false"/>
            <span>No</span>
          </label>
        </form>

        <br>
        <button v-if="!generating" class="button-primary" @click="createSchedule()">Generate Schedule</button>
        <button v-else class="button-primary">Generating</button>
        <h1>Suitable Options</h1>
        <p>Because there are a thousands sometimes hundreds of thousands of possible combinations we provide the top 5
          compatible course schedule for you to choose from.</p>
        <table v-for="courses in createdSchedule" :key="courses.name">
          <thead>
          <tr>
            <th>Name</th>
            <th>Professor</th>
            <th>Class Type</th>
            <th>Class Number</th>
            <th>Score</th>
            <th>Time</th>
            <th>Days</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="class_obj in courses" :key="class_obj.name">
            <td>{{ class_obj.name }}</td>
            <td>{{ class_obj.prof }}</td>
            <td>{{ class_obj.classType }}</td>
            <td>{{ class_obj.classNumber }}</td>
            <td>{{
                getRMPScore(class_obj.prof.substr(0, class_obj.prof.indexOf(' ')), class_obj.prof.substr(class_obj.prof.indexOf(' ') + 1))
              }}
            </td>
            <td v-if="class_obj.classType.includes('Asynchronous')">Async Class</td>
            <td v-else>{{ class_obj.time }}</td>
            <td>{{ class_obj.days }}</td>

          </tr>
          </tbody>
          <br>
          <br>
          <br>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import {rmpdb} from '../assets/rmp.js'
import {sort} from 'fast-sort';

export default {


  name: 'App',
  data() {
    return {
      classes: null,
      courseNames: [],
      sortedClasses: {},
      createdSchedule: [],
      classTimePreference: "false",
      rmpPreference: "false",
      generating: false,

    }
  },
  async mounted() {
    await this.sortClasses()
  },
  methods: {
    //parses cources from storage into easier json
    async sortClasses() {
      this.courseNames = [];
      let temp = await browser.storage.local.get(['classes'])
      console.log(temp)

      this.classes = temp.classes;

      this.classes.forEach((e) => {
        //Class name wihtout suffix i.e csc413 instead of csc 413[01]
        let splitName = e.name.split('[')[0]
        //if we don't have this course yet add it to coursenames
        if (!this.courseNames.includes(splitName)) {
          this.courseNames.push(splitName)
        }
      })
      // for each course add an index to sorted classes
      this.courseNames.forEach((e) => {
        this.sortedClasses[e] = []
      });
      // for each course name
      Object.keys(this.sortedClasses).forEach((i) => {
        //for each class (i.e csc413[01] not just csc413)
        console.log("classes")
        console.log(this.classes)
        this.classes.forEach((e) => {
          //if the class belongs in a specific course
          if (i === e.name.split('[')[0]) {
            //add it to the sorted classes
            this.sortedClasses[i].push(e)
          }
        })
      })
    },
    async removeClass(className) {
      let temp = await browser.storage.local.get(['classes'])
      let result = temp.classes.filter(name => name.name !== className)
      await browser.storage.local.set({
        classes: result
      })
      await this.sortClasses();
    },
    getKey(test) {
      return Object.keys(test)[0];
    },
    getRMPScore(first, last) {
      let score = rmpdb.find(e => (e.teacherfirstname_t === first && e.teacherlastname_t === last));
      if (!score) {
        return 2.5
      }
      return score.averageratingscore_rf;
    },
    createSchedule() {
      if (this.generating === true) {
        return;
      }
      this.createdSchedule = [];
      console.log("created")
      console.log(JSON.stringify(this.createdSchedule))

      this.generating = true;
      const copied_classes = JSON.parse(JSON.stringify(this.sortedClasses));

      const class_key = Object.keys(copied_classes)[0];

      for (const class_obj of copied_classes[class_key]) {

        let x = {...copied_classes};
        delete x[class_key];
        let y = new Array(class_obj)
        this.checkForConflict(y, null, x)
      }

      this.createdSchedule = this.rankSchedules(this.createdSchedule);

      this.createdSchedule = this.createdSchedule.slice(0, 5);
      console.log(this.createdSchedule)
      this.generating = false;
    },
    rankSchedules(createdSchedule) {
      let tempSchedule = JSON.parse(JSON.stringify(createdSchedule))
      console.log(tempSchedule)
      //Morning class
      tempSchedule.forEach((e) => {
        e["start_time"] = this.scheduleEarliestTime(e)
        e["average_score"] = this.scheduleScore(e)
        e["time_score"] = this.scheduleTimeScore(e)
      })
      let sorted;
      if (this.classTimePreference === "true") {
        console.log("morning class")
        //Morningn Class
        if (this.rmpPreference === "true") {
          console.log("prefers rmp")
          sorted = sort(tempSchedule).by([
            {desc: u => u.average_score},
            {asc: u => u.time_score},
            {asc: u => u.start_time},

          ]);
        } else {
          sorted = sort(tempSchedule).by([
            {asc: u => u.time_score},
            {asc: u => u.start_time},
            {desc: u => u.average_score}
          ]);
        }
      } else {
        if (this.rmpPreference === "true") {
          sorted = sort(tempSchedule).by([
            {desc: u => u.average_score},
            {desc: u => u.start_time},
            {desc: u => u.time_score},
          ]);
        }
        //afternoon class
        sorted = sort(tempSchedule).by([
          {desc: u => u.start_time},
          {desc: u => u.time_score},
          {desc: u => u.average_score}
        ]);
      }

      return sorted;
    },
    scheduleTimeScore(schedule) {
      let timeScore = 0;
      let classAmount = 0

      schedule.forEach((e) => {
        if (e.classType.includes("Asynchronous")) {
          return;
        }
        timeScore += this.parseTime(e.time)[0];
        classAmount++;

      })
      return timeScore / classAmount
    },
    scheduleEarliestTime(schedule) {
      let earliest = 24;

      schedule.forEach((e) => {
        if (e.classType.includes("Asynchronous")) {
          return;
        }
        let temptime = this.parseTime(e.time)
        if (temptime[0] < earliest) {
          earliest = temptime[0]
        }
      })
      return earliest
    },
    checkForConflict(current_track, checkCourse, available_courses) {

      let y = current_track.map((x) => x)

      // Check if the check course fits in the current track.
      for (let current_course of y) {

        if (checkCourse && this.conflicts(checkCourse, current_course)) { // For doing
          return;
        }
      }

      if (checkCourse) {

        y.push(checkCourse);
      }


      if (!available_courses || available_courses === {} || Object.keys(available_courses).length < 1) {
        this.createdSchedule.push(y)

        return;
      }

      const rescurse_course = Object.keys(available_courses)[0];
      let x = {...available_courses};
      delete x[rescurse_course]
      for (const course of available_courses[rescurse_course]) {

        this.checkForConflict(y, course, x);
      }


    },
    conflicts(firstCourse, secondCourse) {
      if (firstCourse.classType.includes("Asynchronous") || secondCourse.classType.includes("Asynchronous")) {
        return false;
      }
      let firstCourseDays = firstCourse.days.split(" ")
      let firstCourseTimes = this.parseTime(firstCourse.time)
      let secondCourseDays = secondCourse.days.split(" ")
      let secondCourseTimes = this.parseTime(secondCourse.time)
      for (let i of firstCourseDays) {
        for (let j of secondCourseDays) {
          if (i === j) {
            if ((firstCourseTimes[0] <= secondCourseTimes[1]) && (secondCourseTimes[0] <= firstCourseTimes[1])) {
              return true;
            }
          }
        }
      }
      return false;
    },
    //Returns the overall average score of a schedule
    scheduleScore(schedule) {
      let total = 0;
      schedule.forEach((e) => {
        total += this.getRMPScore(e.prof.substr(0, e.prof.indexOf(' ')), e.prof.substr(e.prof.indexOf(' ') + 1))

      })
      return total / schedule.length
    },

    parseTime(times) {
      let parsedTimes = []
      let time = times.split(" - ");
      time.forEach((i) => {
        let hours = Number(i.match(/^(\d+)/)[1]);
        let minutes = Number(i.match(/:(\d+)/)[1]);
        let AMPM = i.match(/\s(.*)$/)[1];
        if (AMPM === "PM" && hours < 12) hours = hours + 12;
        if (AMPM === "AM" && hours === 12) hours = hours - 12;
        let sHours = hours;
        let sMinutes = minutes;
        parsedTimes.push(sHours + (sMinutes === 0 ? 0 : sMinutes / 60))
      })
      return parsedTimes;

    }
  }
}
</script>
<style>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

.bold {
  font-weight: bold;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}

.switch {
  display: inline-block;
  height: 24px;
  position: relative;
  width: 50px;
}

.switch input {
  display: none;
}

.button-primary {
  padding: 10px;
  border: 50px;
  background-color: #2594ff;
  color: white;

}

.button-danger {
  padding: 10px;
  border: 50px;
  background-color: #ff0000;
  color: white;

}

input {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.row {
  display: -webkit-box;
  display: flex;
}

.row .col {
  -webkit-box-flex: 1;
  flex: 1;
}

.row .col:last-child {
  margin-left: 1em;
}

/* Accordion styles */
.tabs {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.5);
}

.tab {
  width: 100%;
  color: white;
  overflow: hidden;
}

.tab-label {
  display: -webkit-box;
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  padding: 1em;
  background: #8c8c8c;
  font-weight: bold;
  cursor: pointer;
  /* Icon */
}

.tab-label:hover {
  background: #8c8c8c;
}

.tab-label::after {
  content: "\276F";
  width: 1em;
  height: 1em;
  text-align: center;
  -webkit-transition: all .35s;
  transition: all .35s;
}

.tab-content {
  max-height: 0;
  padding: 0 1em;
  color: #2c3e50;
  background: white;
  -webkit-transition: all .35s;
  transition: all .35s;
}

.tab-close {
  display: -webkit-box;
  display: flex;
  -webkit-box-pack: end;
  justify-content: flex-end;
  padding: 1em;
  font-size: 0.75em;
  background: #2c3e50;
  cursor: pointer;
}

.tab-close:hover {
  background: #1a252f;
}

input:checked + .tab-label {
  background: #1a252f;
}

input:checked + .tab-label::after {
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
}

input:checked ~ .tab-content {
  max-height: 100vh;
  padding: 1em;
}

form {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}

label {
  display: flex;
  cursor: pointer;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  margin-bottom: 0.375em;
  /* Accessible outline */
  /* Remove comment to use */
  /*
  	&:focus-within {
  			outline: .125em solid $primary-color;
  	}
  */
}

label input {
  position: absolute;
  left: -9999px;
}

label input:checked + span {
  background-color: #d6d6e5;
}

label input:checked + span:before {
  box-shadow: inset 0 0 0 0.4375em #00005c;
}

label span {
  display: flex;
  align-items: center;
  padding: 0.375em 0.75em 0.375em 0.375em;
  border-radius: 99em;
  transition: 0.25s ease;
}

label span:hover {
  background-color: #d6d6e5;
}

label span:before {
  display: flex;
  flex-shrink: 0;
  content: "";
  background-color: #fff;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  margin-right: 0.375em;
  transition: 0.25s ease;
  box-shadow: inset 0 0 0 0.125em #00005c;
}

.container {
  display: flex;
  flex-flow: wrap column;
}
</style>
