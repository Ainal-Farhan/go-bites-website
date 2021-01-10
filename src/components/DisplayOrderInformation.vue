<template>
    <div id="orderInformation">
        <div class="table-responsive-xl">
            <table v-if="userLabels" class="table">
                <thead class="thead-dark">
                    <tr>
                        <th :colspan="userLabels.length" scope="col" style="display:table-cell;vertical-align:middle;text-align:center;">
                            <h3> {{ userType.substring(0,1).toUpperCase() + userType.substring(1).toLowerCase() }} Information</h3>
                        </th>
                    </tr>
                    <tr>
                        <th v-for="label in userLabels" :key="label.label" scope="col" style="display:table-cell;vertical-align:middle;text-align:center;">
                            {{ label.label }}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="orders.length == 0">
                        <td :colspan="userLabels.length" scope="row">
                            <h3>There is no data in the database.</h3>
                        </td>
                    </tr>
                    <tr v-for="(order, index) in orders" :key="index" v-else>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            {{ index + 1 + initialNo }}
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            {{ order[0].order.custname }}
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            {{ order[0].order.address }}
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            {{ order[0].order.dateOrdered.substring(0, 10) }}
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            {{ order[0].order.dateOrdered.substring(11, 16) }}
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            {{ order[0].order.orderId }}
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            <div v-for="(orderItem, j) in order" :key="j">
                                {{orderItem.order.quantity}}
                            </div>
                        </td>  
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            <div v-for="(orderItem, j) in order" :key="j">
                                {{orderItem.order.menu}}
                            </div>
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            <div v-for="(orderItem, j) in order" :key="j">
                                RM{{orderItem.order.pricePerMenu}}
                            </div>
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            RM{{ order[0].order.totalPrice }}
                        </td>
                        <td scope="row" style="display:table-cell;vertical-align:middle;text-align:center;">
                            {{ order[0].order.status }}
                        </td>
                        <td v-if="order[0].order.status == 'PREPARING'" style="display:table-cell;vertical-align:middle;text-align:center;">
                            Waiting For Delivery
                        </td>
                        <td v-else-if="order[0].order.status == 'DELIVERING'" style="display:table-cell;vertical-align:middle;text-align:center;">
                            <button type="button" class="btn btn-primary form-control btn-manage-custom" @click="updateOrderStatus(order[0].order.orderInfo)">Update</button>
                        </td>
                        <td v-else-if="order[0].order.status == 'DONE'" style="display:table-cell;vertical-align:middle;text-align:center;">
                            Updated
                        </td>
                        <td v-else>
                            None
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'OrderInformation',
    props: {
        userType: {
            type: String
        },
        orders: {
            type: Array
        },
        userLabels: {
            type: Array
        },
        unWantedProperty: {
            type: String
        }, 
        initialNo: {
            type: Number,
        },
    },
    methods: {
        updateOrderStatus(order) {
            console.log(order);
            this.$emit('updateOrderStatus', order);
        }
    }
}
</script>

<style lang="scss" scoped>
    #userInformation {
        .btn-manage-custom {
            width: 100px;
            height: 30px;
            padding: 1px 1px 1px 1px;
        }

        td,
        th {
            text-align: center;
        }

        td {
            vertical-align:middle;
        }
    }
</style>
