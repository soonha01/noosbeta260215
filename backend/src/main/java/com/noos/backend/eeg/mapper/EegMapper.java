package com.noos.backend.eeg.mapper;

import com.noos.backend.eeg.dto.EegResult;
import com.noos.backend.eeg.dto.EegSession;
import com.noos.backend.eeg.dto.EegWindowResult;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EegMapper {

    void insertEegSession(EegSession eegSession);

    EegSession selectEegSessionById(@Param("eegSessionId") Long eegSessionId);

    void updateEegSessionStatus(@Param("eegSessionId") Long eegSessionId, @Param("status") String status);

    void insertEegResult(EegResult eegResult);

    void insertEegWindowResult(EegWindowResult eegWindowResult);
}
