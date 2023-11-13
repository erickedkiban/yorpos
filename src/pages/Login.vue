<template>
  <div>
    <div class="row">
      <div class="col-5">
        <!-- Content for col-4 -->
      </div>
      <div class="col-7 with-background-image">
        <!-- No content for col-8 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.with-background-image {
  background-image: url('../assets/bg.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  height: 100vh; /* 100% of viewport height */
}

/* Ensure the parent container has a minimum height */
.row {
  min-height: 100vh; /* 100% of viewport height */
}
div {
  min-height: 100vh; /* 100% of viewport height */
}
</style>
