/**
 * The laptop in the post "Restarting fixes Windows because your apps are broken", step
 * by step: what was physically true of it, what its screen could measure by
 * then, and how the game was running.
 *
 * Every number here was read off the machine (the logs are in the post) except
 * the two frame rates marked "counter", which are what the game's own counter
 * showed me. A step with `fps: null` is one where nothing was measuring yet:
 * the screen still moves, at a pace that is an illustration and says so.
 */

/** How often the screen repaints, and how often it stalls. */
export interface Pace {
	/** Frames a second, drawn from this range each frame. */
	fps: [number, number]
	/** Stalls: how long between them and how long each holds, in ms. */
	hitch?: { gap: [number, number]; hold: [number, number] }
}

/** One instrument on the screen. */
export interface Reading {
	key: "gpu" | "video" | "commit" | "kernel"
	value: string
	/** This reading is the problem. */
	bad?: boolean
}

export interface Step {
	id: string
	when: string
	title: string
	/** What a frame counter read, or null if there was none to read. */
	fps: [number, number] | null
	pace: Pace
	/** Rear lifted on the printed riser. */
	raised: boolean
	/** 0 cool, 1 warm, 2 at its thermal limit. */
	heat: 0 | 1 | 2
	readings: Reading[]
	/** Entries in the kernel's list, once we knew to count them. */
	list?: number
	/** The last thing done to the machine. */
	log: string
}

/** Process objects in the kernel on the day: 306 alive, the rest dead. */
export const LIST_FULL = 33_015
export const LIST_ALIVE = 306

const rough: Pace = {
	fps: [26, 44],
	hitch: { gap: [900, 2600], hold: [120, 420] },
}
const stutter: Pace = {
	fps: [27, 37],
	hitch: { gap: [450, 1500], hold: [90, 260] },
}
const smooth: Pace = { fps: [60, 60] }

export const steps: Step[] = [
	{
		id: "server",
		when: "before",
		title: "Always on, slower by the day",
		fps: null,
		pace: rough,
		raised: false,
		heat: 1,
		readings: [],
		log: "taskkill /f /im audiodg.exe  # every boot",
	},
	{
		id: "airflow",
		when: "before",
		title: "A printed riser, clean fins",
		fps: null,
		pace: { fps: [30, 46], hitch: { gap: [1500, 3200], hold: [100, 300] } },
		raised: true,
		heat: 1,
		readings: [],
		log: "riser printed, fins cleaned",
	},
	{
		id: "measure",
		when: "Sep 7, 15:25",
		title: "The GPU says why",
		fps: null,
		pace: { fps: [22, 34], hitch: { gap: [1200, 2600], hold: [100, 260] } },
		raised: true,
		heat: 2,
		readings: [{ key: "gpu", value: "87 °C  thermal slowdown", bad: true }],
		log: "nvidia-smi --query-gpu=clocks_event_reasons.active",
	},
	{
		id: "tuned",
		when: "Sep 7, 21:14",
		title: "1440p, gaming mode",
		fps: [60, 60],
		pace: smooth,
		raised: true,
		heat: 1,
		readings: [{ key: "gpu", value: "1440p  +15 W  CPU 35 W" }],
		log: "gaming-mode.ps1",
	},
	{
		id: "collapse",
		when: "Sep 27, 12:29",
		title: "Twenty days of uptime",
		fps: [2, 2],
		pace: { fps: [2, 2] },
		raised: true,
		heat: 2,
		readings: [
			{ key: "gpu", value: "83 °C  100 W, no game open", bad: true },
		],
		log: "can't restart, my wife is watching a movie",
	},
	{
		id: "transcode",
		when: "Sep 27, 12:43",
		title: "Subtitles off",
		fps: [21, 33],
		pace: stutter,
		raised: true,
		heat: 1,
		readings: [
			{ key: "gpu", value: "77 °C" },
			{ key: "video", value: "decode 0%  encode 0%" },
		],
		log: "iPad: subtitles off, direct play",
	},
	{
		id: "overlay",
		when: "Sep 27, 13:03",
		title: "12.7 GB back",
		fps: [21, 33],
		pace: stutter,
		raised: true,
		heat: 1,
		readings: [
			{ key: "gpu", value: "80 °C" },
			{ key: "video", value: "decode 0%  encode 0%" },
			{ key: "commit", value: "35.6 of 49.9 GB" },
		],
		log: "Stop-Process -Id 14080  # NVIDIA Overlay",
	},
	{
		id: "kernel",
		when: "Sep 27, 13:29",
		title: "306 alive, 32,709 dead",
		fps: [21, 33],
		pace: stutter,
		raised: true,
		heat: 1,
		readings: [
			{ key: "gpu", value: "80 °C" },
			{ key: "video", value: "decode 0%  encode 0%" },
			{ key: "commit", value: "35.6 of 49.9 GB" },
			{ key: "kernel", value: "System 1.25 cores", bad: true },
		],
		list: LIST_FULL,
		log: "xperf -on PROFILE -stackwalk Profile",
	},
	{
		id: "fixed",
		when: "Sep 27, 13:32",
		title: "No restart",
		fps: [60, 60],
		pace: smooth,
		raised: true,
		heat: 1,
		readings: [
			{ key: "gpu", value: "80 °C" },
			{ key: "video", value: "decode 0%  encode 0%" },
			{ key: "commit", value: "35.6 of 49.9 GB" },
			{ key: "kernel", value: "System 0.2 cores" },
		],
		list: LIST_ALIVE + 260,
		log: "Stop-Service 'Razer Game Manager Service'",
	},
]

export const stepById = (id: string): Step =>
	steps.find(step => step.id === id) ?? steps[0]
