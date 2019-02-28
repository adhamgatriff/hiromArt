<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style>

  html {
    overflow-x: visible;
  }
  
  body {
    background-image: linear-gradient(to right, #74befa, #ce93d8);
    background-repeat: repeat;
  }

  #app {
    font-family: 'Roboto', sans-serif;  
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>