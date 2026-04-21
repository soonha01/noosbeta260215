package com.noos.backend.eeg.mapper;

import com.noos.backend.eeg.dto.EegResult;
import com.noos.backend.eeg.dto.EegSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EegMapper {

    void insertEegSession(EegSession eegSession);

    void updateEegSessionStatus(@Param("eegSessionId") Long eegSessionId, @Param("status") String status);

    void insertEegResult(EegResult eegResult);
}
