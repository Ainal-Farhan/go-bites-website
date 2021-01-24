<template>
    <div id="dashboard">
        <div class="small">
            <div class="label-graph" v-if='!isLoadingYear && !isLoadingMonth && !isLoadingDay'>
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
        </div>
        <div class="row">
            <div class="col graph">
                <loading v-if='isLoadingYear' />
                <h3 v-if='isLoadingYear'>Generating the Graph</h3>
                <line-chart :chart-data="chartDataPerYear" v-if="!isLoadingYear"></line-chart>
            </div>
            <div class="col graph">
                <loading v-if='isLoadingMonth' />
                <h3 v-if='isLoadingMonth'>Generating the Graph</h3>
                <line-chart :chart-data="chartDataPerMonth" v-if="!isLoadingMonth"></line-chart>
            </div>
            <div class="col graph">
                <loading v-if='isLoadingDay' />
                <h3 v-if='isLoadingDay'>Generating the Graph</h3>
                <line-chart :chart-data="chartDataPerDay" v-if="!isLoadingDay"></line-chart>
            </div>
        </div>
        
        <hr v-if='!isLoadingYear && !isLoadingMonth && !isLoadingDay'>
        
        <div class="table report" v-if='!isLoadingYear && !isLoadingMonth && !isLoadingDay'>
            <h4></h4>
            <table>
                <thead>
                    <tr>
                        <th colspan="4">Report for {{ selectedDay }} {{ selectedMonth }} {{ selectedYear }}</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>DAY</th>
                        <th>MONTH</th>
                        <th>YEAR</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Profits</th>
                        <td>RM{{ totalProfitForSelectedDay }}</td>
                        <td>RM{{ totalProfitForSelectedMonth }}</td>
                        <td>RM{{ totalProfitForSelectedYear }}</td>
                    </tr>
                </tbody>
            </table>
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
            chartDataPerYear: null,
            chartDataPerMonth: null,
            chartDataPerDay: null,
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
            selectedYear: "2021",
            selectedMonth: "January",
            selectedDay: 1,
            dayAvailable: 31,
            
            monthAvailable: [ 
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

            totalProfitForSelectedDay: .0,
            totalProfitForSelectedMonth: .0,
            totalProfitForSelectedYear: .0,

            isLoadingYear: false,
            isLoadingMonth: false,
            isLoadingDay: false,
        }
    },
    mounted () {
        this.getData();
    },
    methods: {
        getData() {
            this.retrieveAllProfitsPerYear();
            this.retrieveAllProfitsPerMonthInSelectedYear();
            this.retrieveAllProfitsForSelectedDay();
        },
        async retrieveAllProfitsPerMonthInSelectedYear() {
            
            this.isLoadingMonth = true;    
            var resultTotalProfit = [];
            var dayForLabels = [];
            
            var resultForEachDay = {};

            var selectedM = {};

            var totalProfits = .0;

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

            for(var m = 0; m < resultTotalProfit.length; m++) {
                totalProfits += parseFloat(resultTotalProfit[m]);
            }
            this.totalProfitForSelectedMonth = parseFloat(totalProfits).toFixed(2);

            // console.log(resultForEachDay);
            this.fillDataMonth(resultForEachDay); 
            this.isLoadingMonth = false;    
        },
        async retrieveAllProfitsPerYear() {
            this.isLoadingYear = true;    
            var resultTotalProfit = [];
            var resultForEachMonth = {};
            
            resultTotalProfit.push("0.00");
            var totalProfits = .0;

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
            for(var s = 0; s < resultTotalProfit.length; s++) {
                totalProfits += parseFloat(resultTotalProfit[s]);
            }
            
            this.totalProfitForSelectedYear = parseFloat(totalProfits).toFixed(2);
            this.fillDataYear(resultForEachMonth);  
            this.isLoadingYear = false;      
        },
        async retrieveAllProfitsForSelectedDay() {
            this.isLoadingDay = true;    
            var resultTotalProfit = [];
            var timeLabels = [];
            
            var resultForEachDay = {};
            var totalProfits = .0;

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
                        console.log(profit);
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
            
            for(var m = 0; m < resultTotalProfit.length; m++) {
                totalProfits += parseFloat(resultTotalProfit[m]);
            }

            this.totalProfitForSelectedDay = parseFloat(totalProfits).toFixed(2);
            
            this.fillDataDay(resultForEachDay); 
            this.isLoadingDay = false;
        },
        fillDataYear (result) {
            this.chartDataPerYear = {
                labels: this.labels,
                datasets: [
                        {
                            label: 'Profit Gained Per Month in RM',
                            backgroundColor: '#00FF00',
                            data: result.totalProfitForEachMonth
                        }
                    ]
                }
        },
        fillDataMonth (result) {
            this.chartDataPerMonth = {
                labels: result.labels,
                datasets: [
                        {
                            label: 'Profit Gained Per Day in RM',
                            backgroundColor: '#00FF00',
                            data: result.totalProfitForEachDay
                        }
                    ]
                }
        },
        fillDataDay (result) {
            this.chartDataPerDay = {
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

        
        .label-graph {
            max-width: 90%;
            display: block;
            margin-right: auto;
            margin-left: auto;
            margin-bottom: 20px;
        }
    }

    .graph {
        max-width: 33%;
        display: block;
        margin-right: auto;
        margin-left: auto;
    }
        
    .report {
        max-width: 90%;
        display: block;
        margin-right: auto;
        margin-left: auto;
        margin-top: 20px;
        padding: 10px 10px 10px 10px;
        table{
            width: 100%;
            
            th, td {
                text-align: center;
            }
        }
    }
</style>
