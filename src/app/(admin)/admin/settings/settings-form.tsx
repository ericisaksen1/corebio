"use client"

import { useState, useTransition, lazy, Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { updateSettings, sendTestEmail } from "@/actions/settings"

const RichTextEditor = lazy(() => import("@/components/admin/rich-text-editor").then(m => ({ default: m.RichTextEditor })))

interface SettingsFormProps {
  settings: Record<string, string>
  isSuperAdmin: boolean
}

type SettingsTab = "general" | "payment" | "shipping" | "email" | "popup"

const tabs: { key: SettingsTab; label: string; superAdminOnly?: boolean }[] = [
  { key: "general", label: "General" },
  { key: "payment", label: "Payment" },
  { key: "shipping", label: "Shipping & Rates" },
  { key: "email", label: "Email" },
  { key: "popup", label: "Entry Popup", superAdminOnly: true },
]

const settingGroups: {
  title: string
  tab: SettingsTab
  description?: string
  superAdminOnly?: boolean
  fields: { key: string; label: string; type: string; placeholder?: string; min?: string; max?: string }[]
}[] = [
  {
    title: "Store",
    tab: "general",
    fields: [
      { key: "store_name", label: "Store Name", type: "text" },
      { key: "store_description", label: "Store Description", type: "text" },
    ],
  },
  {
    title: "Venmo",
    tab: "payment",
    fields: [
      { key: "venmo_username", label: "Venmo Username", type: "text", placeholder: "YourUsername" },
      { key: "venmo_qr_url", label: "Venmo QR Code URL (optional)", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "Cash App",
    tab: "payment",
    fields: [
      { key: "cashapp_tag", label: "Cash App Tag", type: "text", placeholder: "$YourCashTag" },
      { key: "cashapp_qr_url", label: "Cash App QR Code URL (optional)", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "Bitcoin",
    tab: "payment",
    fields: [
      { key: "bitcoin_address", label: "Bitcoin Wallet Address", type: "text", placeholder: "bc1q..." },
      { key: "bitcoin_qr_url", label: "Bitcoin QR Code URL (optional)", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "Rates",
    tab: "shipping",
    fields: [
      { key: "tax_rate", label: "Tax Rate (%)", type: "number", placeholder: "0", min: "0", max: "100" },
      { key: "shipping_flat_rate", label: "Flat Shipping Rate ($)", type: "number", placeholder: "0", min: "0", max: "1000" },
      { key: "default_commission_rate", label: "Default Affiliate Commission (%)", type: "number", placeholder: "10", min: "0", max: "100" },
      { key: "affiliate_discount_rate", label: "Affiliate Discount for Customers (%)", type: "number", placeholder: "10", min: "0", max: "100" },
      { key: "parent_commission_rate", label: "Parent Affiliate Commission (%)", type: "number", placeholder: "5", min: "0", max: "100" },
      { key: "affiliate_cookie_days", label: "Affiliate Cookie Duration (days)", type: "number", placeholder: "30", min: "1", max: "365" },
    ],
  },
  {
    title: "Inventory Alerts",
    tab: "shipping",
    description: "Get notified when products are running low or out of stock.",
    fields: [
      { key: "low_stock_threshold", label: "Low Stock Threshold", type: "number", placeholder: "10" },
    ],
  },
  {
    title: "Shipping (ShipStation)",
    tab: "shipping",
    superAdminOnly: true,
    description: "Configure ShipStation for shipping label generation (UPS, FedEx, USPS).",
    fields: [
      { key: "shipstation_api_key", label: "ShipStation API Key", type: "password" },
      { key: "shipstation_carrier_ids", label: "Carrier IDs (comma-separated)", type: "text", placeholder: "se-123456,se-789012" },
      { key: "ship_from_name", label: "Ship From Name", type: "text", placeholder: "Your Store" },
      { key: "ship_from_street", label: "Ship From Street", type: "text", placeholder: "123 Main St" },
      { key: "ship_from_city", label: "Ship From City", type: "text", placeholder: "City" },
      { key: "ship_from_state", label: "Ship From State", type: "text", placeholder: "CA" },
      { key: "ship_from_zip", label: "Ship From ZIP", type: "text", placeholder: "90210" },
      { key: "ship_from_phone", label: "Ship From Phone", type: "text", placeholder: "555-555-5555" },
    ],
  },
]

export function SettingsForm({ settings, isSuperAdmin }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [emailProvider, setEmailProvider] = useState(settings.email_provider || "smtp")
  const [affiliatesEnabled, setAffiliatesEnabled] = useState(settings.enable_affiliates !== "false")
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const { toast } = useToast()

  // Entry popup state
  const [popupEnabled, setPopupEnabled] = useState(settings.entry_popup_enabled === "true")
  const [popupShowLogo, setPopupShowLogo] = useState(settings.entry_popup_show_logo !== "false")
  const [popupContent, setPopupContent] = useState(settings.entry_popup_content || "")
  const [popupPersistence, setPopupPersistence] = useState(settings.entry_popup_persistence || "session")
  const [popupOverlayOpacity, setPopupOverlayOpacity] = useState(Number(settings.entry_popup_overlay_opacity) || 60)
  const [popupColors, setPopupColors] = useState({
    overlay: settings.entry_popup_overlay_color || "",
    bg: settings.entry_popup_bg_color || "",
    headline: settings.entry_popup_headline_color || "",
    text: settings.entry_popup_text_color || "",
    agreeBg: settings.entry_popup_agree_bg_color || "",
    agreeText: settings.entry_popup_agree_text_color || "",
    disagreeBg: settings.entry_popup_disagree_bg_color || "",
    disagreeText: settings.entry_popup_disagree_text_color || "",
  })

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSettings(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Settings saved!")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-6">
      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.filter((t) => !t.superAdminOnly || isSuperAdmin).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — all tabs stay in DOM so form values are submitted */}
      {settingGroups.filter((g) => !g.superAdminOnly || isSuperAdmin).map((group) => (
        <div key={group.title} style={{ display: activeTab === group.tab ? undefined : "none" }}>
          <div className="mt-6">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            {group.description && (
              <p className="mt-1 text-sm text-gray-500">{group.description}</p>
            )}
            <div className="mt-4 space-y-4">
              {group.fields.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  name={`setting_${field.key}`}
                  type={field.type || "text"}
                  defaultValue={settings[field.key] || ""}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Features — part of "general" tab */}
      <div style={{ display: activeTab === "general" ? undefined : "none" }}>
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Features</h2>
          <p className="mt-1 text-sm text-gray-500">Enable or disable store features.</p>
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <span className="text-sm font-medium text-gray-900">Affiliate Program</span>
                <p className="text-xs text-gray-500">Allow users to apply as affiliates and earn commissions on referrals.</p>
              </div>
              <input type="hidden" name="setting_enable_affiliates" value={affiliatesEnabled ? "true" : "false"} />
              <button
                type="button"
                role="switch"
                aria-checked={affiliatesEnabled}
                onClick={() => setAffiliatesEnabled(!affiliatesEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  affiliatesEnabled ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                    affiliatesEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Email Notifications — part of "email" tab */}
      <div style={{ display: activeTab === "email" ? undefined : "none" }}>
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Email Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">Configure email provider and notification settings.</p>
          <div className="mt-4 space-y-4">
            <Input
              label="From Name"
              name="setting_email_from_name"
              defaultValue={settings.email_from_name || ""}
              placeholder="Your Store"
            />
            <Input
              label="From Email Address"
              name="setting_email_from_address"
              type="email"
              defaultValue={settings.email_from_address || ""}
              placeholder="orders@yourstore.com"
            />
            <Input
              label="Admin Notification Email"
              name="setting_admin_notification_email"
              type="email"
              defaultValue={settings.admin_notification_email || ""}
              placeholder="admin@yourstore.com"
            />

            {isSuperAdmin && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700">Email Provider Configuration</h3>
                </div>
                <Select
                  label="Email Provider"
                  name="setting_email_provider"
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value)}
                >
                  <option value="smtp">SMTP</option>
                  <option value="resend">Resend</option>
                  <option value="sendgrid">SendGrid</option>
                </Select>

                {emailProvider === "smtp" && (
                  <>
                    <Input
                      label="SMTP Host"
                      name="setting_email_smtp_host"
                      defaultValue={settings.email_smtp_host || ""}
                      placeholder="smtp.gmail.com"
                    />
                    <Input
                      label="SMTP Port"
                      name="setting_email_smtp_port"
                      type="number"
                      defaultValue={settings.email_smtp_port || ""}
                      placeholder="587"
                    />
                    <Input
                      label="SMTP Username"
                      name="setting_email_smtp_user"
                      defaultValue={settings.email_smtp_user || ""}
                    />
                    <Input
                      label="SMTP Password"
                      name="setting_email_smtp_password"
                      type="password"
                      defaultValue={settings.email_smtp_password || ""}
                    />
                  </>
                )}

                {emailProvider === "resend" && (
                  <Input
                    label="Resend API Key"
                    name="setting_email_resend_api_key"
                    type="password"
                    defaultValue={settings.email_resend_api_key || ""}
                    placeholder="re_..."
                  />
                )}

                {emailProvider === "sendgrid" && (
                  <Input
                    label="SendGrid API Key"
                    name="setting_email_sendgrid_api_key"
                    type="password"
                    defaultValue={settings.email_sendgrid_api_key || ""}
                    placeholder="SG...."
                  />
                )}
              </>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="mb-2 text-sm text-gray-500">Save your settings first, then send a test email to the admin notification address.</p>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await sendTestEmail()
                    if (result.error) {
                      toast(result.error, "error")
                    } else {
                      toast("Test email sent! Check your inbox.")
                    }
                  })
                }}
              >
                {isPending ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Popup — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <div style={{ display: activeTab === "popup" ? undefined : "none" }}>
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Entry Popup</h2>
            <p className="mt-1 text-sm text-gray-500">
              Show a popup when visitors first enter your site. Useful for age verification or terms agreement.
            </p>
            <div className="mt-4 space-y-4">
              {/* Enabled toggle */}
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable Entry Popup</span>
                  <p className="text-xs text-gray-500">Show a popup when visitors first enter the site.</p>
                </div>
                <input type="hidden" name="setting_entry_popup_enabled" value={popupEnabled ? "true" : "false"} />
                <button
                  type="button"
                  role="switch"
                  aria-checked={popupEnabled}
                  onClick={() => setPopupEnabled(!popupEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    popupEnabled ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                      popupEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>

              {/* Show Logo toggle */}
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <span className="text-sm font-medium text-gray-900">Display Site Logo</span>
                  <p className="text-xs text-gray-500">Show the site logo at the top of the popup.</p>
                </div>
                <input type="hidden" name="setting_entry_popup_show_logo" value={popupShowLogo ? "true" : "false"} />
                <button
                  type="button"
                  role="switch"
                  aria-checked={popupShowLogo}
                  onClick={() => setPopupShowLogo(!popupShowLogo)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    popupShowLogo ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                      popupShowLogo ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>

              <Input
                label="Headline"
                name="setting_entry_popup_headline"
                defaultValue={settings.entry_popup_headline || ""}
                placeholder="Welcome to our site"
              />

              {/* Rich text content */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Content</label>
                <input type="hidden" name="setting_entry_popup_content" value={popupContent} />
                <Suspense fallback={<div className="h-[300px] rounded-md border border-gray-200 bg-gray-50" />}>
                  <RichTextEditor content={popupContent} onChange={setPopupContent} />
                </Suspense>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Buttons</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Agree Button Text"
                    name="setting_entry_popup_agree_text"
                    defaultValue={settings.entry_popup_agree_text || ""}
                    placeholder="I Agree"
                  />
                  <Input
                    label="Disagree Button Text"
                    name="setting_entry_popup_disagree_text"
                    defaultValue={settings.entry_popup_disagree_text || ""}
                    placeholder="I Disagree"
                  />
                </div>
              </div>

              <Input
                label="Disagree Redirect URL"
                name="setting_entry_popup_disagree_url"
                defaultValue={settings.entry_popup_disagree_url || ""}
                placeholder="https://google.com"
              />

              <Select
                label="Remember User Choice"
                name="setting_entry_popup_persistence"
                value={popupPersistence}
                onChange={(e) => setPopupPersistence(e.target.value)}
              >
                <option value="every_visit">Every Visit (always show)</option>
                <option value="session">Session (until browser closes)</option>
                <option value="permanent">Permanent (never show again)</option>
              </Select>

              {/* Colors */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Colors</h3>
                  <button
                    type="button"
                    className="text-xs text-gray-500 underline hover:text-gray-700"
                    onClick={() => { setPopupColors({ overlay: "", bg: "", headline: "", text: "", agreeBg: "", agreeText: "", disagreeBg: "", disagreeText: "" }); setPopupOverlayOpacity(60) }}
                  >
                    Reset to defaults
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Leave blank to use global theme colors.</p>

                {/* Hidden inputs for form submission */}
                <input type="hidden" name="setting_entry_popup_overlay_opacity" value={String(popupOverlayOpacity)} />
                <input type="hidden" name="setting_entry_popup_overlay_color" value={popupColors.overlay} />
                <input type="hidden" name="setting_entry_popup_bg_color" value={popupColors.bg} />
                <input type="hidden" name="setting_entry_popup_headline_color" value={popupColors.headline} />
                <input type="hidden" name="setting_entry_popup_text_color" value={popupColors.text} />
                <input type="hidden" name="setting_entry_popup_agree_bg_color" value={popupColors.agreeBg} />
                <input type="hidden" name="setting_entry_popup_agree_text_color" value={popupColors.agreeText} />
                <input type="hidden" name="setting_entry_popup_disagree_bg_color" value={popupColors.disagreeBg} />
                <input type="hidden" name="setting_entry_popup_disagree_text_color" value={popupColors.disagreeText} />

                {(() => {
                  const themeSwatches = [
                    { color: settings.primary_color || "#000000", label: "Primary" },
                    { color: settings.secondary_color || "#4b5563", label: "Secondary" },
                    { color: settings.accent_color || "#2563eb", label: "Accent" },
                    { color: settings.foreground_color || "#171717", label: "Foreground" },
                    { color: settings.background_color || "#ffffff", label: "Background" },
                    { color: settings.muted_color || "#f3f4f6", label: "Muted" },
                    { color: settings.border_color || "#e5e7eb", label: "Border" },
                  ]
                  return (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {([
                    { key: "overlay", label: "Overlay", desc: "Background behind modal" },
                    { key: "bg", label: "Panel Background", desc: "Modal panel" },
                    { key: "headline", label: "Headline", desc: "Headline text" },
                    { key: "text", label: "Content Text", desc: "Body content" },
                    { key: "agreeBg", label: "Agree Button", desc: "Background" },
                    { key: "agreeText", label: "Agree Text", desc: "Label color" },
                    { key: "disagreeBg", label: "Disagree Button", desc: "Background" },
                    { key: "disagreeText", label: "Disagree Text", desc: "Label color" },
                  ] as const).map((item) => (
                    <div key={item.key}>
                      <label className="mb-1 block text-xs font-medium text-gray-600">{item.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={popupColors[item.key] || "#000000"}
                          onChange={(e) => setPopupColors((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          className="h-8 w-10 cursor-pointer rounded border border-gray-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={popupColors[item.key]}
                          onChange={(e) => setPopupColors((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          placeholder={item.desc}
                          className="h-8 w-full rounded-md border border-gray-300 px-2 font-mono text-xs uppercase focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      {themeSwatches.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="mr-1 text-[10px] text-gray-400">Theme:</span>
                          {themeSwatches.map((s) => (
                            <button
                              key={s.label}
                              type="button"
                              title={s.label}
                              onClick={() => setPopupColors((prev) => ({ ...prev, [item.key]: s.color }))}
                              className={`h-5 w-5 rounded-full border-2 transition-all hover:scale-110 ${
                                popupColors[item.key].toLowerCase() === s.color.toLowerCase()
                                  ? "border-black ring-1 ring-black ring-offset-1"
                                  : "border-gray-300"
                              }`}
                              style={{ backgroundColor: s.color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                  )
                })()}

                {/* Overlay Opacity */}
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Overlay Opacity: {popupOverlayOpacity}%
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={popupOverlayOpacity}
                      onChange={(e) => setPopupOverlayOpacity(Number(e.target.value))}
                      className="h-2 flex-1 cursor-pointer accent-black"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={popupOverlayOpacity}
                      onChange={(e) => setPopupOverlayOpacity(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                      className="h-8 w-16 rounded-md border border-gray-300 px-2 text-center font-mono text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}
