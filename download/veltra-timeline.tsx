"use client";

/**
 * Veltra Timeline Section
 * Drop-in Next.js Client Component.
 * Replaces the existing OS mockup on the homepage.
 *
 * Spec: Veltra — A Day With Veltra (Spec v1.0)
 *
 * Usage:
 *   import { VeltraTimeline } from "@/components/veltra-timeline";
 *   <VeltraTimeline />
 *
 * Dependencies:
 *   - framer-motion (npm i framer-motion)
 *
 * Props: none. The beats are baked in. They are the product.
 * Do not paraphrase the copy. Do not abbreviate. The voice is the product.
 */

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./veltra-timeline.module.css";

type Beat = {
  time: string;
  meridiem: string;
  event: string;
  response: string;
  copy: string;
};

const BEATS: Beat[] = [
  {
    time: "06:42",
    meridiem: "AM",
    event: "Pattern detected. Three Tuesday no-shows, two weeks running.",
    response:
      "Veltra cross-referenced the last eight Tuesdays. Three patients repeat the absence. Two of them schedule after night shifts. One has a HbA1c trend moving the wrong direction. The slot loss is not random. It is structural.",
    copy: "2 of 3 no-show patients show a 14-day pattern. Slot loss is recurring, not random. Suggested: reschedule with morning preference.",
  },
  {
    time: "06:43",
    meridiem: "AM",
    event: "Action taken. Reschedule messages sent, before the clinic opens.",
    response:
      "Two WhatsApp messages. Two SMS fallbacks. Tone: warm, short, in the patient's preferred language. No discounts offered. No urgency manufactured. The message assumes the patient wants to come back. They usually do.",
    copy: "Mrs. Hala — Wednesday 9:30 AM offered. Mr. Tariq — Thursday 8:00 AM offered. Both accepted within 22 minutes.",
  },
  {
    time: "06:44",
    meridiem: "AM",
    event: "Waitlist patient #4 reached. Slot filled before the phone rings.",
    response:
      "The opened slot is offered to the next waitlisted patient whose visit type matches. Veltra does not ask the receptionist. Veltra asks the patient. The receptionist sees the result, not the request. The slot is filled in under four minutes.",
    copy: "Slot 10:15 AM → Mr. Yusuf (waitlist #4, follow-up, 20-min visit). Confirmed. Receptionist notified, not asked.",
  },
  {
    time: "07:15",
    meridiem: "AM",
    event: "Pre-visit preparation. Chart readied before the patient arrives.",
    response:
      "Mr. Khalid walks in at 9:00. At 7:15, Veltra has already pulled his last three visits, his last two lab results, his outstanding prescription, and the cardiology note from the referral. The doctor does not open a chart. The doctor walks into a chart that is already open.",
    copy: "Mr. Khalid · 09:00 · Chart prepared. Last visit: 87 days ago. Insulin overdue. Cardiology note pending review.",
  },
  {
    time: "09:00",
    meridiem: "AM",
    event: "Patient arrives. Check-in is a glance, not a process.",
    response:
      "The patient is recognized by their appointment, not their paperwork. Veltra marks them arrived, alerts the nurse, and starts the wait-time clock. The receptionist did not type. The patient did not fill a form. The clinic did not lose ninety seconds per visit, which is forty-five minutes a day, which is three hundred hours a year.",
    copy: "Mr. Khalid · Arrived · 09:02. Nurse notified. Wait clock started. Estimated room time: 4 minutes.",
  },
  {
    time: "12:30",
    meridiem: "PM",
    event: "Lab result arrives. Veltra links it, before the doctor sees it.",
    response:
      "The result does not arrive in an inbox. It arrives in context. Veltra places it next to the last result, the last visit, the last prescription. The trend is visible without a click. The doctor does not interpret a number. The doctor interprets a direction.",
    copy: "Mr. Khalid · HbA1c · 8.4% (was 7.9%). Trend: ↑ over 90 days. Linked to insulin overdue. Cardiology follow-up recommended.",
  },
  {
    time: "16:15",
    meridiem: "PM",
    event: "Follow-ups proposed. Four patients, four moments to act.",
    response:
      "Veltra identifies four patients seen today who match a follow-up pattern. Not because of a rule. Because of memory. Each patient's follow-up window is set by their own history, not by a default. The doctor reviews in twelve seconds. Approves three. Defers one.",
    copy: "4 follow-ups proposed · 3 approved · 1 deferred. Windows: 30 / 60 / 90 / 14 days. Each based on patient's own return pattern.",
  },
  {
    time: "18:00",
    meridiem: "PM",
    event: "End of day. The clinic is summarized, not just closed.",
    response:
      "Veltra does not produce a report. Veltra produces a paragraph. Three appointments converted from no-show. One waitlist fill. One pre-visit chart that saved eleven minutes. One lab trend flagged. The doctor reads it on the way out. The clinic is closed in the doctor's mind, not just in the system.",
    copy: "Tuesday · 18:00 · 32 visits · 3 no-shows recovered · 1 waitlist filled · 1 trend flagged · 11 minutes saved on chart prep.",
  },
  {
    time: "18:01",
    meridiem: "PM",
    event: "Tomorrow prepared. Before today is even over.",
    response:
      "Veltra has already read Wednesday's schedule. Two patients need chart prep. One slot is fragile — the patient has missed twice. The first coffee of the morning will be the only thing the doctor has to wait for.",
    copy: "Wednesday · 09:00 · 2 charts prepared · 1 fragile slot flagged · 1 reschedule offer queued.",
  },
];

function BeatRow({ beat, index }: { beat: Beat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <motion.article
      ref={ref}
      className={styles.beat}
      aria-label={`${beat.time} ${beat.meridiem} — ${beat.event}`}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0 }}
    >
      <div className={styles.beatTime}>
        <span className={styles.time}>{beat.time}</span>
        <small className={styles.meridiem}>{beat.meridiem}</small>
      </div>
      <div className={styles.beatContent}>
        <p className={styles.beatEvent}>{beat.event}</p>
        <p className={styles.beatResponse}>{beat.response}</p>
        <p className={styles.beatCopy} role="status">
          {beat.copy}
        </p>
      </div>
    </motion.article>
  );
}

export function VeltraTimeline() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.5 });

  return (
    <section
      className={styles.section}
      aria-labelledby="veltra-timeline-title"
      id="day-with-veltra"
    >
      <div className={styles.container}>
        <motion.header
          ref={headerRef}
          className={styles.header}
          initial={{ opacity: 0, y: 12 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className={styles.eyebrow}>A Day With Veltra</p>
          <h2 id="veltra-timeline-title" className={styles.title}>
            Nine beats. <em>One Tuesday.</em>
          </h2>
          <p className={styles.subtitle}>
            From 6:42 AM to 6:01 PM. What the clinic looks like when Memory is
            doing its job. The visitor reads the story. The buyer reads the
            receipt.
          </p>
        </motion.header>

        <div className={styles.timeline}>
          {BEATS.map((beat, i) => (
            <BeatRow key={beat.time} beat={beat} index={i} />
          ))}
        </div>

        <footer className={styles.footer}>
          <p className={styles.footerQuote}>
            The clinic does not need a dashboard.{" "}
            <em>It needs a witness.</em>
          </p>
          <a className={styles.footerCta} href="#join">
            → Join the clinics shaping Veltra's memory
          </a>
        </footer>
      </div>
    </section>
  );
}

export default VeltraTimeline;
