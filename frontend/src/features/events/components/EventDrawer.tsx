import { useEffect, useRef, useState } from "react";
import { cssVars } from "@/lib/css-vars";
import type { FestEvent } from "../data/eventDetails";
import { feeLabel, formatFee } from "../format";
import { CategoryChip, RegisterButton } from "./EventBits";
import { categoryOf } from "../utils";
import { ArrowIcon, BookIcon, CloseIcon, DocIcon, DownloadIcon, ExpandIcon } from "./eventIcons";
import RulebookViewer from "./RulebookViewer";

/**
 * Full-page, high-usability Event Details & Rules Modal.
 * Replaces the cramped right-side drawer with a spacious, centered dialog
 * covering description, rounds, team requirements, and official rulebook.
 */
export default function EventDrawer({
  event,
  registered,
  onRegister,
  onClose,
}: {
  event: FestEvent | null;
  registered: boolean;
  onRegister: () => void;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(event);
  const [open, setOpen] = useState(false);
  const [showRulebook, setShowRulebook] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (event) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setShown(event);
      setShowRulebook(false);
      requestAnimationFrame(() => setOpen(true));
    } else {
      setOpen(false);
      setShowRulebook(false);
    }
  }, [event]);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!shown) return null;
  const cat = categoryOf(shown.category);

  const teamSizeLabel =
    shown.teamSize.min === 1 && shown.teamSize.max === 1
      ? "Solo event"
      : shown.teamSize.min === shown.teamSize.max
        ? `${shown.teamSize.min} members / team`
        : `${shown.teamSize.min}–${shown.teamSize.max} members / team`;

  return (
    <>
      <div
        className={`ep-drawer-layer ${open ? "is-open" : ""}`}
        onTransitionEnd={(e) => {
          if (!open && e.target === e.currentTarget) setShown(null);
        }}
      >
        <div className="ep-drawer-scrim" onClick={onClose} aria-hidden="true" />
        <aside
          className="ep-drawer ep-modal-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ep-drawer-title"
          style={cssVars({ "--hue": cat.hue })}
        >
          {/* Header */}
          <div className="ep-drawer-head">
            <div className="ep-drawer-header-content">
              <div className="ep-drawer-tags">
                <span className="ep-tier-tag">
                  {shown.tier === "major" ? "★ Headliner" : "Open Floor"}
                </span>
                <CategoryChip id={shown.category} small />
                <span className="ep-size-tag">{teamSizeLabel}</span>
                {shown.partner && (
                  <span
                    className="ep-partner-tag"
                    style={{
                      background: "rgba(255, 87, 34, 0.15)",
                      color: "#ff7a45",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ⚡ Powered by {shown.partner}
                  </span>
                )}
              </div>
              <h2 id="ep-drawer-title" className="ep-drawer-title">
                {shown.name}
              </h2>
              {shown.taglines.length > 0 && (
                <p className="ep-drawer-tagline">“{shown.taglines[0]}”</p>
              )}
            </div>

            <button
              ref={closeRef}
              type="button"
              className="ep-icon-btn ep-modal-close"
              onClick={onClose}
              aria-label="Close details"
              title="Close (Esc)"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Main Body - 2 Columns on desktop, single column on mobile */}
          <div className="ep-drawer-body">
            <div className="ep-modal-grid">
              {/* Left Column: Event Details & Rules Overview */}
              <div className="ep-modal-col-main">
                {shown.description && (
                  <section className="ep-drawer-block">
                    <h3 className="ep-block-heading">About The Event</h3>
                    <p className="ep-drawer-desc">{shown.description}</p>
                  </section>
                )}

                {shown.rounds && shown.rounds.length > 0 && (
                  <section className="ep-drawer-block">
                    <h3 className="ep-block-heading">Format &amp; Rounds</h3>
                    <div className="ep-rounds-list">
                      {shown.rounds.map((round, idx) => (
                        <div key={round} className="ep-round-item">
                          <span className="ep-round-badge">Round {idx + 1}</span>
                          <span className="ep-round-name">{round}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="ep-drawer-block">
                  <h3 className="ep-block-heading">Event Snapshot</h3>
                  <div className="ep-info-cards">
                    <div className="ep-info-card">
                      <span className="ep-info-label">Entry Fee</span>
                      <strong className="ep-info-val">
                        {formatFee(shown.fee)}
                        {shown.feeUnit && (
                          <span className="ep-info-sub"> / {shown.feeUnit}</span>
                        )}
                      </strong>
                    </div>
                    <div className="ep-info-card">
                      <span className="ep-info-label">Team Composition</span>
                      <strong className="ep-info-val">{teamSizeLabel}</strong>
                    </div>
                    <div className="ep-info-card">
                      <span className="ep-info-label">Category</span>
                      <strong className="ep-info-val">{cat.label}</strong>
                    </div>
                    {shown.prizePool && (
                      <div className="ep-info-card">
                        <span className="ep-info-label">Prize Pool</span>
                        <strong className="ep-info-val" style={{ color: "#f59e0b" }}>
                          {shown.prizePool}
                        </strong>
                      </div>
                    )}
                    {shown.partner && (
                      <div className="ep-info-card">
                        <span className="ep-info-label">
                          {shown.category === "esports" ? "Gaming Partner" : "Powered By"}
                        </span>
                        <strong className="ep-info-val" style={{ color: "#ff5722" }}>
                          {shown.partner}
                        </strong>
                      </div>
                    )}
                  </div>
                </section>

                <section className="ep-drawer-block ep-guidelines-block">
                  <h3 className="ep-block-heading">General Guidelines</h3>
                  <ul className="ep-guidelines-list">
                    <li>Valid college student ID card is mandatory for all team participants.</li>
                    <li>All members must report to the designated venue 15 minutes prior to start.</li>
                    <li>Decisions of the judges and organizing committee shall be final and binding.</li>
                  </ul>
                </section>
              </div>

              {/* Right Column: Rulebook Document & PDF Viewer */}
              <div className="ep-modal-col-rules">
                {shown.rulebookPdf ? (
                  <section className="ep-drawer-block ep-drawer-rulebook-block">
                    <div className="ep-drawer-rb-head">
                      <div className="ep-drawer-rb-meta">
                        <BookIcon className="ep-doc-icon" />
                        <div>
                          <h3 className="ep-drawer-rb-title">Official Rulebook</h3>
                          <p className="ep-drawer-rb-sub">
                            Rules, judging rubrics, rounds &amp; scoring guidelines
                          </p>
                        </div>
                      </div>
                      <div className="ep-drawer-rb-tools">
                        <button
                          type="button"
                          className="ep-drawer-rb-btn"
                          onClick={() => setShowRulebook(true)}
                          title="Open Fullscreen View"
                        >
                          <ExpandIcon className="ep-rb-icon" />
                          <span>Fullscreen</span>
                        </button>
                        <a
                          className="ep-drawer-rb-btn ep-rb-download"
                          href={shown.rulebookPdf}
                          download
                          title="Download Rulebook PDF"
                        >
                          <DownloadIcon className="ep-rb-icon" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>

                    {/* Generous embedded PDF Viewer */}
                    <div className="ep-drawer-pdf-box ep-modal-pdf">
                      <iframe
                        src={`${shown.rulebookPdf}#toolbar=0&navpanes=0&view=FitH`}
                        title={`${shown.name} Rulebook`}
                        className="ep-drawer-pdf-frame"
                        loading="lazy"
                      />
                    </div>
                  </section>
                ) : shown.docUrl ? (
                  <section className="ep-drawer-block ep-doc-showcase">
                    <div className="ep-doc-card">
                      <DocIcon className="ep-doc-card-icon" />
                      <div className="ep-doc-card-info">
                        <h3 className="ep-drawer-rb-title">Rules Document</h3>
                        <p className="ep-drawer-rb-sub">
                          Detailed rules, format, timeline and scoring criteria are available in the official document.
                        </p>
                      </div>
                      <a
                        className="ep-btn-ghost ep-doc-launch-btn"
                        href={shown.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>Open Document</span>
                        <ArrowIcon className="ep-btn-icon" />
                      </a>
                    </div>
                  </section>
                ) : shown.partner || shown.prizePool ? (
                  <section className="ep-drawer-block ep-doc-showcase">
                    <div
                      className="ep-doc-card ep-partner-feature-card"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 87, 34, 0.08) 0%, rgba(20, 20, 25, 0.6) 100%)",
                        border: "1px solid rgba(255, 87, 34, 0.25)",
                        padding: "24px",
                        borderRadius: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          alignSelf: "flex-start",
                          background: "rgba(255, 87, 34, 0.18)",
                          color: "#ff7a45",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        OFFICIAL GAMING PARTNER
                      </div>
                      <h3
                        className="ep-drawer-rb-title"
                        style={{ fontSize: "1.35rem", margin: "0" }}
                      >
                        {shown.partner ? `${shown.partner} × Udgam 2K26` : shown.name}
                      </h3>
                      <p
                        className="ep-drawer-rb-sub"
                        style={{
                          fontSize: "0.95rem",
                          lineHeight: "1.6",
                          color: "var(--muted-foreground, #a1a1aa)",
                          margin: "0",
                        }}
                      >
                        {shown.description ||
                          `Official championship for ${shown.name} at Udgam 2026.`}
                      </p>
                      {shown.prizePool && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "12px 16px",
                            background: "rgba(245, 158, 11, 0.12)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fbbf24" }}>
                            🏆 Winning Prize Pool
                          </span>
                          <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f59e0b" }}>
                            {shown.prizePool}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>
                ) : (
                  <section className="ep-drawer-block ep-doc-showcase">
                    <div className="ep-doc-card ep-doc-placeholder">
                      <BookIcon className="ep-doc-card-icon" />
                      <div>
                        <h3 className="ep-drawer-rb-title">Rules Announcement</h3>
                        <p className="ep-drawer-rb-sub">
                          The official rulebook PDF is being finalised and will be uploaded here shortly.
                        </p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="ep-drawer-foot">
            <div className="ep-foot-pricing">
              <span className="ep-drawer-fee">{formatFee(shown.fee)}</span>
              <span className="ep-drawer-fee-label">{feeLabel(shown)}</span>
            </div>
            <div className="ep-foot-actions">
              <button type="button" className="ep-btn-ghost ep-foot-dismiss" onClick={onClose}>
                Close
              </button>
              <RegisterButton
                registered={registered}
                onRegister={onRegister}
                eventName={shown.name}
                size="lg"
                href={shown.registerUrl}
                closed={!!shown.registrationClosed}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Fullscreen Rulebook PDF Modal */}
      {showRulebook && shown.rulebookPdf && (
        <RulebookViewer
          pdfUrl={shown.rulebookPdf}
          eventName={shown.name}
          onClose={() => setShowRulebook(false)}
        />
      )}
    </>
  );
}
