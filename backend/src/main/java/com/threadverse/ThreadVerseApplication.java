package com.threadverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ThreadVerseApplication {
    public static void main(String[] args) {
        SpringApplication.run(ThreadVerseApplication.class, args);
    }
}
