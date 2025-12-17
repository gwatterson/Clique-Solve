<template>
  <header>
    <div style="margin-top: 25px;">
      <img alt="CliqueSolve logo" class="logo" src="./assets/logo2.svg" height="75" />
    </div>
  </header>
  <main>
    <div class="wrapper">
      <GraphUploadForm />
    </div>
    <!--Footer-->
  </main>
  <div class="footer">
    <small>
      Guelfo Watterson - Faculty of Engineering Technology - 
      <a href="https://www.kuleuven.be/english/kuleuven/index.html">KU Leuven</a> 2023/2024
    </small>
  </div>
</template>

<script setup lang="ts">
  import GraphUploadForm from '@/components/NewGraph.vue';
</script>

<style scoped>
.wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  place-items: flex-start;
  flex-wrap: wrap;
  margin-top: 150px;
  padding-bottom: 50px;
}

@media (min-width: 1024px) {
  .wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    place-items: flex-start;
    flex-wrap: wrap;
    margin-top: 0px;
    margin-bottom: 50px;
  }
}
</style>