<template>
<div id="home">
    <div class="container">
        <ChartContainer />
    </div>
</div>
</template>

<script>
import ChartContainer from '../components/chart/ChartContainer.vue'

export default {
    name: 'Home',
    components: {
        ChartContainer
    },
}
</script>

<style lang="scss">
    #home {
        .container {
            width: 80%;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
    }
</style>
