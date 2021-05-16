<template>
  <div class="flex">
    <h1>SFSU Scheduler</h1>
    <a class="button-primary" target="_blank" href="/index.html">Go To Scheduler</a><br>
    <a class="button-primary" @click="clearStorage()">Clear Current Selections</a>
    <p>Created by <a href="https://github.com/cpaczek" target="_blank">Cameron Paczek</a></p>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods:{
    clearStorage(){
      browser.storage.local.clear()
    }
  }
}
</script>

<style>
html {
  width: 400px;
}
.flex{
  display: flex;
  flex-flow: wrap column;
}
.button-primary {
  padding: 10px;
  border: 50px;
  background-color: #2594ff;
  color: white;
  margin: auto;
  text-decoration: none;

}
.button-primary:hover{
  cursor: pointer;
}
</style>
