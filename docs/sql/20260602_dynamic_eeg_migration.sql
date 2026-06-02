-- Dynamic EEG storage migration.
-- Apply after deploying code that no longer uploads EEG raw chunks.

DROP TABLE IF EXISTS eeg_raw_chunks;

ALTER TABLE eeg_sessions
    MODIFY user_id BIGINT NULL;

CREATE TABLE IF NOT EXISTS eeg_window_results (
    eeg_window_result_id BIGINT NOT NULL AUTO_INCREMENT,
    eeg_session_id BIGINT NOT NULL,
    window_index INT NULL,
    window_start_at DATETIME NOT NULL,
    window_end_at DATETIME NOT NULL,
    window_duration_sec INT NOT NULL,
    sample_count INT NOT NULL DEFAULT 0,
    sample_rate_hz INT NOT NULL DEFAULT 256,
    analysis_mode VARCHAR(50) NOT NULL DEFAULT 'muse-live-window',
    delta FLOAT NOT NULL DEFAULT 0,
    theta FLOAT NOT NULL DEFAULT 0,
    alpha FLOAT NOT NULL DEFAULT 0,
    beta FLOAT NULL,
    gamma FLOAT NULL,
    dominant_band VARCHAR(20) NULL,
    state_key VARCHAR(50) NULL,
    state_label VARCHAR(80) NULL,
    confidence FLOAT NULL,
    quality_score DECIMAL(5,3) NULL,
    feature_source VARCHAR(30) NULL,
    focus_score FLOAT NULL,
    relax_score FLOAT NULL,
    stress_score FLOAT NULL,
    mental_workload_score DECIMAL(5,3) NULL,
    fatigue_risk_score DECIMAL(5,3) NULL,
    cortical_arousal_score DECIMAL(5,3) NULL,
    analysis_version VARCHAR(30) NULL,
    raw_ai_response_json LONGTEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (eeg_window_result_id),
    UNIQUE KEY uq_eeg_window_results_session_window (eeg_session_id, window_index),
    KEY idx_eeg_window_results_session_id (eeg_session_id),
    KEY idx_eeg_window_results_window_end_at (window_end_at),
    KEY idx_eeg_window_results_state_key (state_key),
    CONSTRAINT fk_eeg_window_results_session
        FOREIGN KEY (eeg_session_id) REFERENCES eeg_sessions (eeg_session_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS intervention_events (
    intervention_event_id BIGINT NOT NULL AUTO_INCREMENT,
    eeg_session_id BIGINT NOT NULL,
    eeg_window_result_id BIGINT NULL,
    event_type VARCHAR(20) NOT NULL,
    previous_state_key VARCHAR(50) NULL,
    next_state_key VARCHAR(50) NULL,
    decision_reason VARCHAR(120) NULL,
    music_prompt TEXT NULL,
    music_audio_url TEXT NULL,
    music_track_id VARCHAR(120) NULL,
    light_scene_id VARCHAR(120) NULL,
    light_color VARCHAR(40) NULL,
    light_brightness INT NULL,
    light_temperature INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_at DATETIME NULL,
    PRIMARY KEY (intervention_event_id),
    KEY idx_intervention_events_session_id (eeg_session_id),
    KEY idx_intervention_events_window_result_id (eeg_window_result_id),
    KEY idx_intervention_events_created_at (created_at),
    CONSTRAINT fk_intervention_events_session
        FOREIGN KEY (eeg_session_id) REFERENCES eeg_sessions (eeg_session_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_intervention_events_window_result
        FOREIGN KEY (eeg_window_result_id) REFERENCES eeg_window_results (eeg_window_result_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
