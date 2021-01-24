<template>
<div id="orderList">
    <div v-if='isLoading'>
        <h3>Retrieving data...</h3>
        <loading v-if='isLoading' />
    </div>

    <div v-if='!(orders === undefined) && !isLoading'>
        <div v-if="ordersData.length > 0">
            <Search @displaySearchResult="displaySearchResult" @reset="reset" :conditions="conditions" />
        </div>
        
        <DisplayOrderInformation v-if="orders" @updateOrderStatus="updateOrderStatus" :initialNo="initialNo" :userType="userType" :orders="ordersData" :userLabels="orderLabels" :unWantedProperty="unWantedProperty" />
        <Pagination @getProcessedData='getProcessedData' :infoData="searching? searchResult : orders" :userType="userType" :numberOfInformationPerPage="numberOfInformationPerPage" />
    </div>
</div>
</template>

<script>
import OrderItemDataService from '../services/OrderItemDataService';
import OrderDataService from '../services/OrderDataService';
import loading from '../mixins/loading.vue';
import DisplayOrderInformation from '../components/DisplayOrderInformation.vue';
import Search from '../components/search/Search.vue';
import Pagination from '../components/Pagination.vue';

export default {
    name: 'OrderList',
    components: {
        loading,
        DisplayOrderInformation,
        Search,
        Pagination,
    },
    data() {
        return {
            ordersData: [],
            orders: [],
            isLoading: false,
            unWantedProperty: 'orderInfo',
            userType: 'order',

            searchResult: [],
            noSearchResultFound: false,
            searching: false,

            numberOfInformationPerPage: 10,

            initialNo: 0,

            conditions: [
                {
                    condition :"Order ID",
                    toggle :"no",
                },
                {
                    condition :"Customer Name",
                    toggle :"no",
                },
                {
                    condition :"Status",
                    toggle :"no",
                },
            ],

            orderLabels: [
                {label: "No"},
                {label: "Customer Name"},
                {label: "Address"},
                {label: "Date Ordered"},
                {label: "Time Ordered"},
                {label: "Order ID"},
                {label: "Quantity"},
                {label: "Menu"},
                {label: "Price per Menu"},
                {label: "Total Price"},
                {label: "Status"},
                {label: "Action"},
            ]
        }
    },
    methods: {
        async retrieveAllOrdersInformation() {
            await OrderItemDataService.getAllOrderItems()
                .then(response => {
                    this.isLoading = false;
                    var orderItems = [];
                    var orderIDArray = [];
                    
                    
                    for (var i = 0; i < Object.keys(response.data).length; i++) {
                        const order = {};
                        order.quantity = response.data[i].quantity;
                        order.menu = response.data[i].menuitem.itemName;
                        order.pricePerMenu = response.data[i].menuitem.itemPrice;

                        order.custname = response.data[i].order.customer.custname;
                        order.orderId = response.data[i].order.orderid;
                        order.totalPrice = response.data[i].order.totalPrice;
                        order.status = response.data[i].order.status;
                        order.address = response.data[i].order.address;
                        order.dateOrdered = response.data[i].order.addedDate;

                        const orderInfo = {};
                        orderInfo.orderid = response.data[i].order.orderid;
                        orderInfo.totalPrice = response.data[i].order.totalPrice;
                        orderInfo.fk_cid = response.data[i].order.fk_cid;
                        orderInfo.addedDate = response.data[i].order.addedDate;
                        orderInfo.status = response.data[i].order.status;
                        orderInfo.address = response.data[i].order.address;
                        
                        order.orderInfo = orderInfo;
                        orderItems.push(order);
                        if(orderIDArray.length == 0 || orderIDArray === undefined) {
                            orderIDArray.push(order.orderId);
                        }
                        else {
                            var status = false;
                            for(var j = 0; j < orderIDArray.length; j++) {
                                if(order.orderId == orderIDArray[j]) {
                                    status = false;
                                    break;
                                }
                                status = true;
                            }

                            if(status) {
                                orderIDArray.push(order.orderId);
                            }
                        }
                    }
                    
                    for(var k = 0; k < orderIDArray.length;  k++) {
                        var orderArray = [];
                        for(var l = 0; l < orderItems.length; l++) {
                            const order = {};
                            if(orderIDArray[k] == orderItems[l].orderId) {
                                order.order = orderItems[l];
                                orderArray.push(order);
                            }
                        }
                        this.orders.push(orderArray);
                    }
                    console.log(this.orders);
                    console.log(this.orders[0].length);
                }).catch(err => {
                    alert(err.message);
                });
        },
        async updateOrderStatus(order) {
            order.status = "DONE";

            await OrderDataService.updateOrderStatus(order)
                .then(() => {
                    alert("Successfully update the Status to DONE");
                    if(this.searching === true) {
                        for(var i = 0; i < this.searchResult.length; i++) {
                            if(order.orderId === this.searchResult[i].orderId) {
                                this.searchResult[i].status = order.status;
                                break;
                            }
                        }
                    }
                }).catch(() => {
                    alert("Failed to Update the Status Of the Order");
                });

            this.orders = [];
            this.retrieveAllOrdersInformation();
        },
        displaySearchResult(requiredInformation, selectedConditions) {
            this.searchResult = [];
            if(selectedConditions !== undefined && selectedConditions.length > 0) {
                for(var i = 0; i < selectedConditions.length; i++) {
                    if(selectedConditions[i] === "Order ID") {
                        this.searchByOrderID(requiredInformation);
                    }
                    else if(selectedConditions[i] === "Customer Name") {
                        this.searchByCustomerName(requiredInformation);
                    }
                    else if (selectedConditions[i] === "Status") {
                        this.searchByOrderStatus(requiredInformation);
                    }
                }
                if(this.noSearchResultFound) {
                    alert("No Result found");
                }
                else {
                    this.searching = true;
                    this.initialNo = 0;
                }
            }else {
                alert("No filter had been chosen");
            }
        },
        searchByOrderID(requiredInformation) {
            for(var i = 0; i < this.orders.length; i++) {
                if(this.orders[i][0].order.orderId == requiredInformation) {
                    if(this.duplicationDataChecker(this.orders[i]))
                        continue;

                    this.searchResult.push(this.orders[i]);
                }
            }
            if(this.searchResult.length > 0){
                this.noSearchResultFound = false;
                return;
            }
            this.noSearchResultFound = true;
        },
        searchByCustomerName(requiredInformation) {
            for(var i = 0; i < this.orders.length; i++) {
                if(this.orders[i][0].order.custname.toLowerCase().search(requiredInformation.toLowerCase()) != -1) {
                    if(this.duplicationDataChecker(this.orders[i]))
                        continue;

                    this.searchResult.push(this.orders[i]);
                }
            }
            if(this.searchResult.length > 0){
                this.noSearchResultFound = false;
                return;
            }
            this.noSearchResultFound = true;
        },
        searchByOrderStatus(requiredInformation) {
            for(var i = 0; i < this.orders.length; i++) {
                if(this.orders[i][0].order.status.toLowerCase().search(requiredInformation.toLowerCase()) != -1) {
                    if(this.duplicationDataChecker(this.orders[i]))
                        continue;

                    this.searchResult.push(this.orders[i]);
                }
            }
            if(this.searchResult.length > 0){
                this.noSearchResultFound = false;
                return;
            }
            this.noSearchResultFound = true;
        },
        duplicationDataChecker(orderFound) {
            for(var i = 0; i < this.searchResult.length; i++) {
                if(this.searchResult[i] == orderFound) {
                    return true;
                }
            }
            return false;
        },
        reset() {
            this.searching = false;
        },
        unselectCondition(condition) {
            if(this.selectedConditions) {
                for (var i = 0; i < this.selectedConditions.length; i++) {
                    if(this.selectedConditions[i] === condition) {
                        this.selectedConditions.splice(i, 1);
                        break;
                    }
                }
            }
        },
        setSelectedCondition(condition) {
            this.selectedConditions.push(condition);
            console.log(this.selectedConditions);
        },
        getProcessedData(processedData, currentPage) {
            this.initialNo = (currentPage - 1) * this.numberOfInformationPerPage;
            this.ordersData = processedData;
        },
    },
    mounted() {
        this.isLoading = true;
        this.retrieveAllOrdersInformation();
    },
}
</script>

<style lang="scss">
#orderList {
    width: 80%;
    display: block;
    margin-left: auto;
    margin-right: auto;
}

</style>
