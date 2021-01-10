<template>
    <div class="container">
        <div class="small">
            <loading v-if='isLoading' />
            <h3 v-if='isLoading'>Generating the Graph</h3>
            <div class="label-graph" v-if='!isLoading'>
                <div class="row">
                    <div class="col">
                        <div class="form-group row">
                            <label for="year" class="col-1 col-form-label">Year</label>
                            <div class="col-3">
                                <select id="year" class="form-control" v-model="selectedYear">
                                    <option v-for="(year, index) in yearAvailable" :key="index">{{ year }}</option>
                                </select>
                            </div>
                            <label for="month" class="col-1 col-form-label">Month</label>
                            <div class="col-3">
                                <select id="month" class="form-control" v-model="selectedMonth">
                                    <option v-for="(month, index) in monthAvailable" :key="index">{{ month.month }}</option>
                                </select>
                            </div>
                            <label for="day" class="col-1 col-form-label">Day</label>
                            <div class="col-3">
                                <select id="month" class="form-control" v-model="selectedDay">
                                    <option>All</option>
                                    <option v-for="index in dayAvailable" :key="index">{{ index }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="col-2">
                        <button @click="getData()" class="btn btn-primary">Go</button>
                    </div>
                </div>
            </div>
            <div class="graph">
                <line-chart :chart-data="chartData" v-if="!isLoading"></line-chart>
            </div>
        </div>
    </div>
</template>

<script>
import LineChart from './LineChart.js'
import OrderDataService from '../../services/OrderDataService'
import loading from '../../mixins/loading.vue'

export default {
    name: 'LineChartContainer',
    components: { 
        LineChart,
        loading 
    },
    data () {
        return {
            chartData: null,
            labels: [
                "",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ],
            yearAvailable: [
                "2020",
                "2021"
            ],
            selectedYear: "2020",
            selectedMonth: "",
            selectedDay: "",
            dayAvailable: 0,
            
            monthAvailable: [ 
                {
                    month: "All",
                    number: 0
                },
                {
                    month: "January",
                    number: 1,
                    totalDays: 31
                },
                {
                    month: "February",
                    number: 2,
                    totalDays: 29
                },
                {
                    month: "March",
                    number: 3,
                    totalDays: 31
                },
                {
                    month: "April",
                    number: 4,
                    totalDays: 30
                },
                {
                    month: "May",
                    number: 5,
                    totalDays: 31
                },
                {
                    month: "June",
                    number: 6,
                    totalDays: 30
                },
                {
                    month: "July",
                    number: 7,
                    totalDays: 31
                },
                {
                    month: "August",
                    number: 8,
                    totalDays: 31
                },
                {
                    month: "September",
                    number: 9,
                    totalDays: 30
                },
                {
                    month: "October",
                    number: 10,
                    totalDays: 31
                },
                {
                    month: "November",
                    number: 11,
                    totalDays: 30
                },
                {
                    month: "December",
                    number: 12,
                    totalDays: 31
                }
            ],

            isLoading: false,
        }
    },
    mounted () {
        this.selectedMonth = "All";
        this.selectedDay = "All";
        this.retrieveAllProfitsPerYear()
    },
    methods: {
        getData() {
            if(this.selectedMonth === "All" && this.selectedDay === "All") {
                this.retrieveAllProfitsPerYear();
            }else if(this.selectedMonth !== "All" && this.selectedDay === "All"){
                this.retrieveAllProfitsPerMonthInSelectedYear();
            } else if(this.selectedDay !== "All") {
                this.retrieveAllProfitsForSelectedDay();
            }
        },
        async retrieveAllProfitsPerMonthInSelectedYear() {
            this.isLoading = true;
                
            var resultTotalProfit = [];
            var dayForLabels = [];
            
            var resultForEachDay = {};

            var selectedM = {};

            for(var k = 0; k < this.monthAvailable.length; k++) {
                if(this.monthAvailable[k].month === this.selectedMonth) {
                    selectedM = this.monthAvailable[k];
                    break;
                }
            }

            await OrderDataService.getTotalPricePerMonth(this.selectedYear, selectedM.number)
                .then(res => {
                    dayForLabels.push("");
                    resultTotalProfit.push("0.00");

                    if( res.data.length == 0) {
                        dayForLabels.push("No Profit Gained in " + selectedM.month + " " + this.selectedYear);
                        resultTotalProfit.push("0.00");
                    }

                    for(var j = 0; j < res.data.length; j++) {
                        if(res.data[j].totalPrice === null)
                            continue;

                        var profit = parseFloat(res.data[j].totalPrice) * 0.05;
                        var label = res.data[j].addedDate.substring(8,10) + " - " + selectedM.month.substring(0,3);

                        while((j+1) < res.data.length) {
                            if(res.data[j].addedDate.substring(8,10) === res.data[j+1].addedDate.substring(8,10)) {
                                profit += parseFloat(res.data[++j].totalPrice) * 0.05;
                            }else {
                                break;
                            }
                        }
                        
                        dayForLabels.push(label);
                        resultTotalProfit.push(profit.toFixed(2));
                    }
                    
                })
                .catch(err => {
                    alert(err.message);
                });
        
            resultForEachDay.totalProfitForEachDay = resultTotalProfit;
            resultForEachDay.labels = dayForLabels;

            // console.log(resultForEachDay);
            this.fillData(resultForEachDay); 
            
            this.isLoading = false;
        },
        async retrieveAllProfitsPerYear() {
            this.isLoading = true;
                
            var resultTotalProfit = [];
            var resultForEachMonth = {};
            
            resultTotalProfit.push("0.00");

            for(var i = 1; i < 13; i++) {
            await OrderDataService.getTotalPricePerMonth(this.selectedYear, i)
                .then(res => {
                    var totalProfit = .0;
                    for(var j = 0; j < res.data.length; j++) {
                        if(res.data[j].totalPrice === null)
                            continue;
                        totalProfit += (parseFloat(res.data[j].totalPrice)) * 0.05;
                    }
                    resultTotalProfit.push(totalProfit.toFixed(2));
                })
                .catch(err => {
                    alert(err.message);
                });
        }
        
            resultForEachMonth.totalProfitForEachMonth = resultTotalProfit;
            // console.log(resultForEachMonth);
            this.fillData(resultForEachMonth);
            
            this.isLoading = false;            
        },
        async retrieveAllProfitsForSelectedDay() {
            this.isLoading = true;
                
            var resultTotalProfit = [];
            var timeLabels = [];
            
            var resultForEachDay = {};

            var selectedM = {};

            for(var k = 0; k < this.monthAvailable.length; k++) {
                if(this.monthAvailable[k].month === this.selectedMonth) {
                    selectedM = this.monthAvailable[k];
                    break;
                }
            }

            await OrderDataService.getTotalPricePerDay(this.selectedYear, selectedM.number, parseInt(this.selectedDay))
                .then(res => {
                    timeLabels.push("");
                    resultTotalProfit.push("0.00");

                    if( res.data.length == 0) {
                        timeLabels.push("No Profit Gained in " + this.selectedDay + " " + selectedM.month + " " + this.selectedYear);
                        resultTotalProfit.push("0.00");
                    }

                    for(var j = 0; j < res.data.length; j++) {
                        if(res.data[j].totalPrice === null)
                            continue;

                        var profit = parseFloat(res.data[j].totalPrice) * 0.05;
                        var label = res.data[j].addedDate.substring(11, 16) + "H";

                        while((j+1) < res.data.length) {
                            if(res.data[j].addedDate.substring(11, 16) === res.data[j+1].addedDate.substring(11, 16)) {
                                profit += parseFloat(res.data[++j].totalPrice) * 0.05;
                            }else {
                                break;
                            }
                        }
                        
                        timeLabels.push(label);
                        resultTotalProfit.push(profit.toFixed(2));
                    }
                    
                })
                .catch(err => {
                    alert(err.message);
                });
        
            resultForEachDay.totalProfitForAtATime = resultTotalProfit;
            resultForEachDay.labels = timeLabels;

            // console.log(resultForEachDay);
            this.fillData(resultForEachDay); 
            
            this.isLoading = false;
        },
        fillData (result) {
            if(this.selectedMonth !== "All" && this.selectedDay === "All") {
                this.chartData = {
                    labels: result.labels,
                    datasets: [
                            {
                                label: 'Profit Gained Per Day in RM',
                                backgroundColor: '#00FF00',
                                data: result.totalProfitForEachDay
                            }
                        ]
                    }
            }else if(this.selectedMonth === "All" && this.selectedDay === "All"){
                this.chartData = {
                    labels: this.labels,
                    datasets: [
                            {
                                label: 'Profit Gained Per Month in RM',
                                backgroundColor: '#00FF00',
                                data: result.totalProfitForEachMonth
                            }
                        ]
                    }
            }else if(this.selectedDay !== "All") {
                this.chartData = {
                    labels: result.labels,
                    datasets: [
                            {
                                label: 'Profit Gained A a Time in RM',
                                backgroundColor: '#00FF00',
                                data: result.totalProfitForAtATime
                            }
                        ]
                    }
            }
            
            this.isLoading = false;
        }
    },
    watch: {
        selectedMonth: function() {
            for(var i = 0; i < this.monthAvailable.length; i++) {
                if(this.monthAvailable[i].month === this.selectedMonth) {
                    this.dayAvailable = this.monthAvailable[i].totalDays;
                    break;
                }
            }
        },
        selectedYear: function() {
            if(this.selectedYear === "2021") {
                this.monthAvailable[2].totalDays = 28;
            }else if(this.selectedYear === "2020") {
                this.monthAvailable[2].totalDays = 29;
            }

            if(this.selectedMonth === this.monthAvailable[2].month) {
                this.dayAvailable = this.monthAvailable[2].totalDays;
            }
        }
    } 
}
</script>

<style lang="scss">
    .small {
        max-width: 95%;
        display: block;
        margin-right: auto;
        margin-left: auto;

        .graph {
            max-width: 95%;
            display: block;
            margin-right: auto;
            margin-left: auto;
        }
        .label-graph {
            max-width: 90%;
            display: block;
            margin-right: auto;
            margin-left: auto;
        }
    }
</style>