package com.hmdev.messaging.common.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OffsetRange {
    private Long startOffset;
    private Long limit;
}
