package com.hmdev.messaging.service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class AuditService {

    private final String auditFilePath;
    private final List<String> fallback = Collections.synchronizedList(new ArrayList<>());

    public AuditService(@Value("${messaging.audit.file:logs/admin-audit.log}") String auditFilePath) {
        this.auditFilePath = auditFilePath;
    }

    public List<String> tail(int limit) {
        if (limit <= 0) return Collections.emptyList();
        File f = new File(auditFilePath);
        if (f.exists() && f.canRead()) {
            try {
                return tailFile(f, limit);
            } catch (Exception e) {
                // fall through to fallback
            }
        }
        // fallback to in-memory list (newest first)
        synchronized (fallback) {
            int size = fallback.size();
            int from = Math.max(0, size - limit);
            List<String> slice = new ArrayList<>(fallback.subList(from, size));
            Collections.reverse(slice);
            return slice;
        }
    }

    public void seedSample(List<String> sample) {
        if (sample == null) return;
        synchronized (fallback) {
            fallback.clear();
            fallback.addAll(sample);
        }
    }

    private List<String> tailFile(File file, int limit) throws IOException {
        // Read file from end efficiently and collect last `limit` lines. Return newest-first order.
        ArrayList<String> lines = new ArrayList<>();
        try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
            long fileLength = raf.length();
            long pos = fileLength - 1;
            int readLines = 0;
            StringBuilder sb = new StringBuilder();

            while (pos >= 0 && readLines < limit) {
                raf.seek(pos);
                int b = raf.read();
                if (b == '\n') {
                    // finish current line (reverse builder)
                    if (sb.length() > 0) {
                        lines.add(sb.reverse().toString());
                        sb.setLength(0);
                        readLines++;
                    }
                } else if (b != '\r') {
                    sb.append((char) b);
                }
                pos--;
            }
            // Add last line
            if (sb.length() > 0 && readLines < limit) {
                lines.add(sb.reverse().toString());
            }
        }
        // lines collected are newest-first already because we read backwards. However if file ends with newline,
        // the first added line may be the last full line. For consistency, ensure newest-first.
        return lines;
    }
}

