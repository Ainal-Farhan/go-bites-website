<template>
<div id="home">
    <div class="container">
        <h1 class="dashboard-label">Dashboard</h1>
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
            width: 99%;
            display: block;
            margin-left: auto;
            margin-right: auto;

            .dashboard-label {
                text-align: center;
                margin: -10px 10px 10px 10px;
                text-shadow: 0 0 3px #a8df43;
            }
        }
    }
</style>
