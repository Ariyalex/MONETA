-- CreateEnum
CREATE TYPE "ProbeType" AS ENUM ('ICMP', 'HTTP', 'HTTPS', 'TCP');

-- CreateEnum
CREATE TYPE "SeverityType" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "IncidentEventType" AS ENUM ('STATUS_CHANGED', 'NOTE_ADDED', 'NOTE_CHANGED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_targets" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "probe_type" "ProbeType" NOT NULL,
    "interval_seconds" INTEGER NOT NULL,
    "timeout_seconds" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "monitoring_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "incident_type" VARCHAR(250) NOT NULL,
    "severity" "SeverityType" NOT NULL,
    "status" "IncidentStatus" NOT NULL,
    "fingerprint" VARCHAR(500) NOT NULL,
    "first_seen_at" TIMESTAMPTZ(6) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6),
    "resolved_at" TIMESTAMPTZ(6),
    "detection_count" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detection_results" (
    "id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "incident_id" UUID,
    "model_name" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "is_anomaly" BOOLEAN NOT NULL DEFAULT false,
    "anomaly_score" DOUBLE PRECISION,
    "features" JSONB NOT NULL,
    "window_start" TIMESTAMPTZ(6) NOT NULL,
    "window_end" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detection_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_events" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "actor_id" UUID,
    "event_type" "IncidentEventType" NOT NULL,
    "old_status" "IncidentStatus",
    "new_status" "IncidentStatus",
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "monitoring_targets_created_by_idx" ON "monitoring_targets"("created_by");

-- CreateIndex
CREATE INDEX "incidents_fingerprint_idx" ON "incidents"("fingerprint");

-- CreateIndex
CREATE INDEX "incidents_target_id_idx" ON "incidents"("target_id");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_fingerprint_key" ON "incidents"("fingerprint");

-- CreateIndex
CREATE INDEX "detection_results_target_id_idx" ON "detection_results"("target_id");

-- CreateIndex
CREATE INDEX "detection_results_incident_id_idx" ON "detection_results"("incident_id");

-- CreateIndex
CREATE INDEX "incident_events_incident_id_idx" ON "incident_events"("incident_id");

-- CreateIndex
CREATE INDEX "incident_events_actor_id_idx" ON "incident_events"("actor_id");

-- AddForeignKey
ALTER TABLE "monitoring_targets" ADD CONSTRAINT "monitoring_targets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "monitoring_targets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detection_results" ADD CONSTRAINT "detection_results_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "monitoring_targets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detection_results" ADD CONSTRAINT "detection_results_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "incident_events" ADD CONSTRAINT "incident_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_events" ADD CONSTRAINT "incident_events_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
