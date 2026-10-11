package org.nourishnet.service;

import org.nourishnet.dto.NotificationDto;
import org.nourishnet.entity.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String title, String message, String type, String entityType, Long entityId);
    List<NotificationDto> getUserNotifications(String email);
    long getUnreadCount(String email);
    void markAsRead(Long id, String email);
    void markAllAsRead(String email);
}
