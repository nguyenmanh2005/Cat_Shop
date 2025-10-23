package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.OrderDetailRequest;
import com.catshop.catshop.dto.response.OrderDetailResponse;
import com.catshop.catshop.entity.*;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.OrderDetailMapper;
import com.catshop.catshop.repository.*;
import com.catshop.catshop.service.OrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderDetailMapper orderDetailMapper;

    @Override
    public OrderDetailResponse createOrderDetail(OrderDetailRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID: " + request.getOrderId()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + request.getProductId()));

        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }

        OrderDetail orderDetail = orderDetailMapper.toEntity(request);
        orderDetail.setOrder(order);
        orderDetail.setProduct(product);

        OrderDetail saved = orderDetailRepository.save(orderDetail);
        return orderDetailMapper.toResponse(saved);
    }

    @Override
    public OrderDetailResponse updateOrderDetail(Long id, OrderDetailRequest request) {
        OrderDetail existing = orderDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng ID: " + id));

        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }

        existing.setQuantity(request.getQuantity());
        existing.setPrice(request.getPrice());

        OrderDetail updated = orderDetailRepository.save(existing);
        return orderDetailMapper.toResponse(updated);
    }

    @Override
    public void deleteOrderDetail(Long id) {
        OrderDetail existing = orderDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng ID: " + id));
        orderDetailRepository.delete(existing);
    }

    @Override
    public List<OrderDetailResponse> getAllOrder() {
        return orderDetailMapper.toResponseList(
                orderDetailRepository.findAll()
        );
    }

    @Override
    public OrderDetailResponse getOrderDetailById(Long id) {
        OrderDetail orderDetail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng ID: " + id));
        return orderDetailMapper.toResponse(orderDetail);
    }

    @Override
    public List<OrderDetailResponse> getOrderDetailsByOrder(Long orderId) {
        return orderDetailMapper.toResponseList(orderDetailRepository.findByOrder_OrderId(orderId));
    }

    @Override
    public List<OrderDetailResponse> getOrderDetailsByProduct(Long productId) {
        return orderDetailMapper.toResponseList(orderDetailRepository.findByProduct_ProductId(productId));
    }

    @Override
    public Double getOrderTotal(Long orderId) {
        Double total = orderDetailRepository.getOrderTotal(orderId);
        return total != null ? total : 0.0;
    }

    @Override
    public Double getTotalRevenue() {
        Double revenue = orderDetailRepository.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }
}
