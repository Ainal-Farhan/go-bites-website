import http from "../http/common/http-common";

const url = '/orders';

class OrderDataService {
    getAllOrders() {
        return http.get(`${url}`);
    }

    updateOrderStatus(order) {
        return http.put(`${url}/update`, order);
    }

    getTotalPricePerMonth(year, month) {
        return http.get(`${url}/totalPrice?year=${year}&month=${month}`);
    }

    getTotalPricePerDay(year, month, day) {
        return http.get(`${url}/totalPrice?year=${year}&month=${month}&day=${day}`);
    }
}

export default new OrderDataService();