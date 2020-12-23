<template>
  <div>
    <h1>Selected Classes</h1>
    <div v-if="courseNames">

      <div class="col">
        <div class="tabs">
          <div class="tab" v-for="(classes1, key) in sortedClasses" :key="classes1.name">
            <input type="checkbox" :id="key">
            <label class="tab-label" :for="key">{{ key }}</label>
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
                  <td><button class="button-danger" @click="removeClass(classes2.name)">Remove</button></td>
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
    <div class="flex slider-cont">
      <p :class="{ bold: !slider  }">Prioritize Score</p>
      <label class="switch" for="checkbox">
        <input v-model="slider" type="checkbox" id="checkbox"/>
        <div class="slider round"></div>
      </label>
      <p :class="{ bold: slider  }">Prioritize Afternoon Classes</p>
    </div>

    <br>
    <button class="button-primary" @click="createSchedule()">Generate Schedule</button>
    <h1>Suitable Options</h1>
    <p>Because there are a thousands sometimes hundreds of thousands of possible combinations we provide the top 5
      compatible course schedule for you to choose from.</p>
    <table v-for="courses in createdSchedule" :key="courses.name">
      <thead>
      <tr>
        <th>Name</th>
        <th>Professor</th>
        <th>Score</th>
        <th>Time</th>
        <th>Days</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="class_obj in courses" :key="class_obj.name">
        <td>{{ class_obj.name }}</td>
        <td>{{ class_obj.prof }}</td>
        <td>{{
            getRMPScore(class_obj.prof.substr(0, class_obj.prof.indexOf(' ')), class_obj.prof.substr(class_obj.prof.indexOf(' ') + 1))
          }}
        </td>
        <td>{{ class_obj.time }}</td>
        <td>{{ class_obj.days }}</td>

      </tr>
      </tbody>
      <br>
      <br>
      <br>
    </table>
  </div>
</template>

<script>
import {rmpdb} from '../assets/rmp.js'

export default {


  name: 'App',
  data() {
    return {
      classes: null,
      courseNames: [],
      sortedClasses: {},
      createdSchedule: [],
      slider: false,

    }
  },
  async mounted() {
    await this.sortClasses()
  },
  methods: {
    async sortClasses() {
      this.courseNames = [];
      let temp = await browser.storage.local.get(['classes'])
      this.classes = temp.classes;
      this.classes.forEach((e) => {
        let splitName = e.name.split('[')[0]
        if (!this.courseNames.includes(splitName)) {
          this.courseNames.push(splitName)
        }
      })

      this.courseNames.forEach((e) => {
        this.sortedClasses[e] = []
      });

      Object.keys(this.sortedClasses).forEach((i) => {
        this.classes.forEach((e) => {
          if (i === e.name.split('[')[0]) {
            this.sortedClasses[i].push(e)
          }
        })
      })
    },
    async removeClass(className){
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
      return score.averageratingscore_rf;
    },
    createSchedule() {
      const copied_classes = JSON.parse(JSON.stringify(this.sortedClasses));
      const class_key = Object.keys(copied_classes)[0];

      for (const class_obj of copied_classes[class_key]) {
        let x = {...copied_classes};
        delete x[class_key];
        let y = new Array(class_obj)
        this.seeIfSheFits(y, null, x)
      }
      let tempSchedule = JSON.parse(JSON.stringify(this.createdSchedule))
      tempSchedule.forEach((e) => {
        e["start_time"] = this.scheduleEarliestTime(e)
        e["average_score"] = this.scheduleScore(e)
      })

      if (!this.slider) {
        //score
        tempSchedule.sort((a, b) =>
            (a.average_score < b.average_score ? 1 : (a.average_score === b.average_score) ?
                ((a.start_time > b.start_time) ? 1 : -1) : -1));
      } else {
        //afternoon class
        tempSchedule.sort((a, b) => (a.start_time < b.start_time) ? 1 : (a.start_time === b.start_time) ?
            ((a.average_score < b.average_score) ? 1 : -1) : -1)
      }
      this.createdSchedule = tempSchedule;

      this.createdSchedule = this.createdSchedule.slice(0, 5);

    },
    seeIfSheFits(current_track, checkCourse, available_courses) {

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
        console.warn(y)
        this.createdSchedule.push(y)

        return;
      }

      const rescurse_course = Object.keys(available_courses)[0];
      let x = {...available_courses};
      delete x[rescurse_course]
      for (const course of available_courses[rescurse_course]) {

        this.seeIfSheFits(y, course, x);
      }


    },
    conflicts(firstCourse, secondCourse) {
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
    scheduleScore(schedule) {
      let total = 0;
      schedule.forEach((e) => {
        total += this.getRMPScore(e.prof.substr(0, e.prof.indexOf(' ')), e.prof.substr(e.prof.indexOf(' ') + 1))

      })
      return total / schedule.length
    },
    scheduleEarliestTime(schedule) {
      let earliest = 24;

      schedule.forEach((e) => {
        let temptime = this.parseTime(e.time)
        if (temptime[0] < earliest) {
          earliest = temptime[0]
        }
      })
      return earliest
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

.slider {
  background-color: #ccc;
  bottom: 0;
  cursor: pointer;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: .4s;
}

.slider:before {
  background-color: #fff;
  bottom: 4px;
  content: "";
  height: 16px;
  left: 4px;
  position: absolute;
  transition: .4s;
  width: 16px;
}

input + .slider {
  background-color: #2594ff;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}


.slider.round:before {
  border-radius: 50%;
}

.flex {
  display: flex;
}

.slider-cont {
  flex-flow: nowrap;

}

.slider-cont > p,
.slider-cont > p {
  margin: auto 10px;
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
</style>
