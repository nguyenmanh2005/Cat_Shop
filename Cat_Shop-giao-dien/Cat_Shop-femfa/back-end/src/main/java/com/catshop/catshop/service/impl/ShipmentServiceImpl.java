package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.ShipmentRequest;
import com.catshop.catshop.dto.response.ShipmentResponse;
import com.catshop.catshop.entity.Order;
import com.catshop.catshop.entity.Shipment;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.ShipmentMapper;
import com.catshop.catshop.repository.OrderRepository;
import com.catshop.catshop.repository.ShipmentRepository;
import com.catshop.catshop.service.ShipmentService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final ShipmentMapper shipmentMapper;

    // ===============================
    // 👑 ADMIN SECTION
    // ===============================

    @Override
    public List<ShipmentResponse> findAllOrderByDateDesc() {
        List<Shipment> shipments = shipmentRepository.findAllOrderByDateDesc();
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public List<ShipmentResponse> findByStatus(String status) {
        List<Shipment> shipments = shipmentRepository.findByStatus(status);
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public List<ShipmentResponse> searchByAddress(String address) {
        List<Shipment> shipments = shipmentRepository.searchByAddress(address);
        if (shipments.isEmpty())
            throw new ResourceNotFoundException("Không có lượt ship nào với địa chỉ là: " + address);
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public List<ShipmentResponse> findByShippedDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        List<Shipment> shipments = shipmentRepository.findByShippedDateBetween(startDate, endDate);
        if(shipments.isEmpty()){
            throw  new ResourceNotFoundException("Không có đơn ship nào trong khoảng thời gian đó ");
        }
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public List<Object[]> countShipmentsByStatus() {
        List<Object[]> list = shipmentRepository.countShipmentsByStatus();
        if (list.isEmpty()) throw new ResourceNotFoundException("Không có đơn nào cả");
        return list;
    }

    @Override
    public List<ShipmentResponse> findByOrderId(Long orderId) {
        List<Shipment> shipments = shipmentRepository.findByOrderId(orderId);
        if (shipments.isEmpty())
            throw new ResourceNotFoundException("Không có shipment nào với OrderId = " + orderId);
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public List<ShipmentResponse> findAllByUserId(Long userId) {
        List<Shipment> shipments = shipmentRepository.findAllByUserId(userId);
        if (shipments.isEmpty())
            throw new ResourceNotFoundException("Không có shipment nào theo userId = " + userId);
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public Long countShipmentsInCurrentMonth() {
        return shipmentRepository.countShipmentsInCurrentMonth();
    }

    // ===============================
    // CRUD SECTION
    // ===============================

    @Override
    public ShipmentResponse createShipment(ShipmentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng có ID = " + request.getOrderId()));

        Shipment shipment = Shipment.builder()
                .order(order)
                .shippingAddress(request.getShippingAddress())
                .status(request.getStatus())
                .build();

        shipmentRepository.save(shipment);
        return shipmentMapper.toShipmentResponse(shipment);
    }

    @Override
    public ShipmentResponse updateShipment(Long id, ShipmentRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy shipment với ID = " + id));

        if (!shipment.getOrder().getOrderId().equals(request.getOrderId())) {
            Order newOrder = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng có ID = " + request.getOrderId()));
            shipment.setOrder(newOrder);
        }

        shipment.setShippingAddress(request.getShippingAddress());
        shipment.setStatus(request.getStatus());
        shipmentRepository.save(shipment);

        return shipmentMapper.toShipmentResponse(shipment);
    }

    @Override
    public void deleteShipment(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy shipment với ID = " + id));
        shipmentRepository.delete(shipment);
    }

    // ===============================
    // 👤 USER SECTION
    // ===============================

    @Override
    public List<ShipmentResponse> findUserShipments(Long userId) {
        List<Shipment> shipments = shipmentRepository.findUserShipments(userId);
        if (shipments.isEmpty())
            throw new ResourceNotFoundException("Người dùng này chưa có shipment nào.");
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public List<ShipmentResponse> findUserShipmentsByStatus(Long userId, String status) {
        List<Shipment> shipments = shipmentRepository.findUserShipmentsByStatus(userId, status);
        if (shipments.isEmpty())
            throw new ResourceNotFoundException("Không có shipment nào với trạng thái " + status);
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public List<ShipmentResponse> findUserShipmentsByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Shipment> shipments = shipmentRepository.findUserShipmentsByDateRange(userId, startDate, endDate);
        if (shipments.isEmpty())
            throw new ResourceNotFoundException("Không có shipment nào trong khoảng thời gian này.");
        return shipmentMapper.toShipmentResponseList(shipments);
    }

    @Override
    public ShipmentResponse findUserShipmentDetail(Long shipmentId, Long userId) {
        Shipment shipment = shipmentRepository.findUserShipmentDetail(shipmentId, userId);
        if (shipment == null)
            throw new ResourceNotFoundException("Không tìm thấy shipment này hoặc bạn không có quyền xem.");
        return shipmentMapper.toShipmentResponse(shipment);
    }
}
