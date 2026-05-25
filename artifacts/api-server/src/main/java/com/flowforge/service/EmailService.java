package com.flowforge.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendWelcomeEmail(String toEmail, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("hello@demomailtrap.com");
        message.setTo(toEmail);
        message.setSubject("Welcome to FlowForge!");
        message.setText("Hello " + name + ",\n\nWelcome to FlowForge! Your account has been successfully created.\n\nBest regards,\nFlowForge Team");
        mailSender.send(message);
    }

    public void sendWorkflowNotification(String toEmail, String workflowName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("hello@demomailtrap.com");
        message.setTo(toEmail);
        message.setSubject("Workflow Executed: " + workflowName);
        message.setText("Your workflow '" + workflowName + "' has been executed successfully!");
        mailSender.send(message);
    }
}
