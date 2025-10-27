package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.OrderRequest;
import com.catshop.catshop.dto.response.OrderResponse;
import com.catshop.catshop.entity.Order;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.OrderMapper;
import com.catshop.catshop.repository.OrderRepository;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    // Customer
    // checked
    @Override
    public List<OrderResponse> findAllByUserId(Long userId) {
        List<Order> orders = orderRepository.findAllByUserId(userId);
        if (orders.isEmpty()) throw new ResourceNotFoundException("Không có đơn hàng nào cho userId: " + userId);
        return orderMapper.toOrderResponseList(orders);
    }

    //checked
    @Override
    public List<OrderResponse> findByUserAndStatus(Long userId, String status) {
        List<Order> orders = orderRepository.findByUserAndStatus(userId, status);
        if (orders.isEmpty()) throw new ResourceNotFoundException("Không có đơn hàng nào có status: " + status);
        return orderMapper.toOrderResponseList(orders);
    }

    // checked
    @Override
    public List<Object[]> getMonthlySpending(Long userId) {
        return orderRepository.getMonthlySpending(userId);
    }

    //checked
    @Override
    public List<OrderResponse> findOrdersByUserEmail(String email) {
        List<Order> orders = orderRepository.findOrdersByUserEmail(email);
        if (orders.isEmpty()) throw new ResourceNotFoundException("Không có đơn hàng nào cho email: " + email);
        return orderMapper.toOrderResponseList(orders);
    }

    // Admin
    // checked
    @Override
    public List<OrderResponse> findAllOrdersForAdmin() {
        List<Order> orders = orderRepository.findAllOrdersForAdmin();
        return orderMapper.toOrderResponseList(orders);
    }

    //checked
    @Override
    public List<Object[]> countOrdersByStatus() {
        return orderRepository.countOrdersByStatus();
    }

    //checked
    @Override
    public List<Object[]> getMonthlyRevenue() {
        return orderRepository.getMonthlyRevenue();
    }

    //checked
    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        User user = userRepository.findById(orderRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id: " + orderRequest.getUserId()));

        Order order = Order.builder()
                .user(user)
                .status(orderRequest.getStatus())
                .totalAmount(orderRequest.getTotalAmount())
                .build();

        Order savedOrder = orderRepository.save(order);
        return orderMapper.toOrderResponse(savedOrder);
    }

    //checked
    @Override
    @Transactional
    public OrderResponse updateOrder(Long orderId, OrderRequest orderRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy order với id: " + orderId));

        if (orderRequest.getStatus() != null) order.setStatus(orderRequest.getStatus());
        if (orderRequest.getTotalAmount() != null) order.setTotalAmount(orderRequest.getTotalAmount());

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toOrderResponse(updatedOrder);
    }

    //checked
    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Không tìm thấy order với id: " + orderId);
        }
        orderRepository.deleteById(orderId);
    }
}
