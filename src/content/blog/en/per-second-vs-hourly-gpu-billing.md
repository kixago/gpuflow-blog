---
title: "Per-Second vs Hourly GPU Billing: What Short Jobs Really Cost"
description: "At $0.40/h a 90-second GPU test costs 1¢ billed per second and 40¢ billed hourly. Worked examples, a to-scale chart and each platform's increment and minimum."
excerpt: "Billing increments decide what short GPU jobs cost. We price five job lengths under per-second, per-minute and full-hour billing, and list what each platform actually uses."
pubDate: 2026-09-30
locale: "en"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/per-second-vs-hourly-gpu-billing-hero.png"
heroImageAlt: "Illustration of a stopwatch next to a staircase-shaped cost line"
faq:
  - question: "Is per-second GPU billing cheaper than hourly billing?"
    answer: "For short jobs, by a lot. At $0.40 per hour, a 90-second test costs 1¢ billed per second with a 60-second minimum and 40¢ billed by the full hour. For long runs the gap shrinks to at most one partial hour per session."
  - question: "What is the minimum charge for an AWS EC2 instance?"
    answer: "AWS bills On-Demand Linux, Windows, RHEL and Ubuntu Pro instances per second with a 60-second minimum. SUSE Linux Enterprise Server instances are billed by the full hour."
  - question: "Does Azure bill virtual machines per second or per minute?"
    answer: "Per minute. Azure's Linux VM pricing FAQ says it charges for the number of full minutes a VM runs, so a VM that runs 6 minutes 45 seconds is billed for 6 minutes."
  - question: "Does Google Cloud charge a minimum for GPU instances?"
    answer: "Yes. Compute Engine charges vCPUs, GPUs and memory for at least 1 minute, then bills in 1-second increments after that."
  - question: "What do I pay on GPUFlow if I end a rental early?"
    answer: "The seconds you used, with a 60-second minimum, rounded up to the next cent and never more than the amount held. The full booked amount is held when the rental starts and the unused part returns to your credits when it ends."
  - question: "What happens to my GPUFlow rental if the provider's machine goes offline?"
    answer: "If the machine sends no heartbeat for 10 minutes, the rental ends by itself. You are charged only up to the machine's last heartbeat, and the rest of the hold goes back to your credits."
---

At $0.40 an hour, a 90-second test run costs 1¢ if you are billed per second with a 60-second minimum, 1.3¢ if you are billed per minute, and 40¢ if you are billed by the full hour. That 40x gap is the whole story for short jobs. Once a job runs longer than a few minutes, per-second and per-minute billing differ by less than a cent, and the bill is decided by idle time, setup time and storage.

Below: each platform's published rules, worked examples with the arithmetic, a chart drawn to scale, and how GPUFlow's hold-then-refund model becomes a charge. Rules and prices are as of September 2026; the sources are at the end.

## Three ways to count GPU time

Every GPU rental has an hourly price. The difference is how the time you used gets turned into billable time before it is multiplied by that price.

- **Per second with a minimum.** Count the seconds. If the total is under the minimum (usually 60 seconds), bill the minimum. Cost = max(60, seconds) × hourly rate / 3,600.
- **Per minute.** Count the minutes. Platforms differ on what they do with a partial minute: some round up, Azure drops it. In the examples below I round up, which is the worse case for you. Cost = minutes × hourly rate / 60.
- **Full hour.** Any started hour is a whole hour. A 61-minute job is two hours. Cost = ceil(seconds / 3,600) × hourly rate.

The minimum matters more than people expect. Per-second billing with a 60-second minimum and per-minute billing are identical for anything under a minute. The increment only changes the leftover fraction at the end of a job, so it can never cost you more than one increment per session: just under 40¢ per session with hourly billing at $0.40, and under 0.7¢ per session with per-minute billing at the same rate (59 seconds × 40 / 3,600 = 0.66¢).

## What each platform uses

These are the published rules for on-demand instances, checked against each vendor's own documentation in September 2026.

| Platform | Increment | Minimum | Note from the docs |
| --- | --- | --- | --- |
| AWS EC2 On-Demand | Per second | 60 seconds | Applies to Linux, Windows, RHEL and Ubuntu Pro. SUSE Linux Enterprise Server is billed by the full hour. |
| Google Cloud Compute Engine | Per second | 1 minute | "All vCPUs, GPUs, and GB of memory are charged a minimum of 1 minute." |
| Azure Virtual Machines | Per minute | None stated | Bills "the number of full minutes"; a VM run for 6 min 45 s is billed 6 minutes. |
| Lambda (on-demand cloud) | Per minute | None stated | Bills "in one-minute increments" from when the instance passes health checks until you terminate it. |
| RunPod Pods | Per second | None stated | Compute and storage both billed by the second. |
| Vast.ai | Per second | None stated | Active rental billed every second; storage billed every second the instance exists unless it is offline. |
| GPUFlow | Per second | 60 seconds | Whole seconds, rounded up to the cent, capped at the amount held. |

Two notes on reading this. Azure's rule actually rounds down: its FAQ says you are "not billed for any extra seconds". Lambda's docs say one-minute increments without saying which way a partial minute goes, so I have not assumed either. And "none stated" means exactly that: the docs I read name no minimum, which is different from a documented zero.

None of these platforms rounds GPU compute to the full hour for the instance types above. Hourly rounding still shows up in the fine print, as with SUSE on AWS, so check the billing page before you run a lot of short jobs somewhere new.

## Five jobs at $0.40 an hour

Here is one rate, $0.40 per hour, applied to five job lengths. That is 40¢ per 3,600 seconds, or 1/90 of a cent per second.

**A 90-second test.** Per second: 90 × 40 / 3,600 = 1.0¢. Per minute: 2 minutes × 40 / 60 = 1.33¢. Full hour: 40¢. The hourly bill is 40 times the per-second bill.

**7 minutes 30 seconds.** Per second: 450 × 40 / 3,600 = 5.0¢. Per minute: 8 minutes × 40 / 60 = 5.33¢. Full hour: 40¢, 8 times more.

**38 minutes 20 seconds.** Per second: 2,300 × 40 / 3,600 = 25.56¢. Per minute: 39 minutes × 40 / 60 = 26.0¢. Full hour: 40¢, about 1.57 times more.

**61 minutes.** Per second: 3,660 × 40 / 3,600 = 40.67¢. Per minute: 61 × 40 / 60 = 40.67¢ (the job ends on a whole minute, so the two agree). Full hour: two hours, 80¢. One extra minute nearly doubles the hourly bill.

| Job length | Per second (60 s min) | Per minute (rounded up) | Full hour | GPUFlow charge |
| --- | --- | --- | --- | --- |
| 1 min 30 s | 1.00¢ | 1.33¢ | 40¢ | 1¢ |
| 7 min 30 s | 5.00¢ | 5.33¢ | 40¢ | 5¢ |
| 38 min 20 s | 25.56¢ | 26.00¢ | 40¢ | 26¢ |
| 61 min | 40.67¢ | 40.67¢ | 80¢ | 41¢ |
| 20 jobs of 2 min 30 s | 33.33¢ | 40.00¢ | $8.00 | 40¢ (20 rentals) |

The GPUFlow column is the per-second result rounded up to a whole cent for each rental, which is what its billing code does. The last row is explained two sections down.

## Cost against job length, to scale

The first chart runs from 0 to 150 minutes. The per-minute staircase has steps 1 minute wide and 0.67¢ tall, so at this scale it sits on top of the per-second line. The full-hour line is the staircase that matters: it jumps 40¢ at 0, 60 and 120 minutes.

<figure>
<svg viewBox="0 0 720 400" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Cost of one job at 0.40 dollars per hour from 0 to 150 minutes under per-second, per-minute and full-hour billing</title>
<rect x="0" y="0" width="720" height="400" fill="#ffffff"/>
<line x1="90" y1="320.0" x2="690" y2="320.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="325.0" text-anchor="end" fill="#64748b" font-size="13">$0.00</text>
<line x1="90" y1="275.0" x2="690" y2="275.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="280.0" text-anchor="end" fill="#64748b" font-size="13">$0.20</text>
<line x1="90" y1="230.0" x2="690" y2="230.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="235.0" text-anchor="end" fill="#64748b" font-size="13">$0.40</text>
<line x1="90" y1="185.0" x2="690" y2="185.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="190.0" text-anchor="end" fill="#64748b" font-size="13">$0.60</text>
<line x1="90" y1="140.0" x2="690" y2="140.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="145.0" text-anchor="end" fill="#64748b" font-size="13">$0.80</text>
<line x1="90" y1="95.0" x2="690" y2="95.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="100.0" text-anchor="end" fill="#64748b" font-size="13">$1.00</text>
<line x1="90" y1="50.0" x2="690" y2="50.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="55.0" text-anchor="end" fill="#64748b" font-size="13">$1.20</text>
<line x1="90.0" y1="320" x2="90.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="90.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<line x1="210.0" y1="320" x2="210.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="210.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">30</text>
<line x1="330.0" y1="320" x2="330.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="330.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">60</text>
<line x1="450.0" y1="320" x2="450.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="450.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">90</text>
<line x1="570.0" y1="320" x2="570.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="570.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">120</text>
<line x1="690.0" y1="320" x2="690.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="690.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">150</text>
<line x1="90" y1="320" x2="690" y2="320" stroke="#64748b" stroke-width="1.5"/>
<line x1="90" y1="50" x2="90" y2="320" stroke="#64748b" stroke-width="1.5"/>
<text x="390.0" y="365" text-anchor="middle" fill="#1e1b4b">Job length (minutes)</text>
<text x="22" y="185.0" text-anchor="middle" fill="#1e1b4b" transform="rotate(-90 22 185.0)">Cost at $0.40 per hour</text>
<polyline fill="none" stroke="#f97316" stroke-width="3" points="90.0,230.0 330.0,230.0 330.0,140.0 570.0,140.0 570.0,50.0 690.0,50.0"/>
<polyline fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" points="90.0,318.5 94.0,318.5 94.0,317.0 98.0,317.0 98.0,315.5 102.0,315.5 102.0,314.0 106.0,314.0 106.0,312.5 110.0,312.5 110.0,311.0 114.0,311.0 114.0,309.5 118.0,309.5 118.0,308.0 122.0,308.0 122.0,306.5 126.0,306.5 126.0,305.0 130.0,305.0 130.0,303.5 134.0,303.5 134.0,302.0 138.0,302.0 138.0,300.5 142.0,300.5 142.0,299.0 146.0,299.0 146.0,297.5 150.0,297.5 150.0,296.0 154.0,296.0 154.0,294.5 158.0,294.5 158.0,293.0 162.0,293.0 162.0,291.5 166.0,291.5 166.0,290.0 170.0,290.0 170.0,288.5 174.0,288.5 174.0,287.0 178.0,287.0 178.0,285.5 182.0,285.5 182.0,284.0 186.0,284.0 186.0,282.5 190.0,282.5 190.0,281.0 194.0,281.0 194.0,279.5 198.0,279.5 198.0,278.0 202.0,278.0 202.0,276.5 206.0,276.5 206.0,275.0 210.0,275.0 210.0,273.5 214.0,273.5 214.0,272.0 218.0,272.0 218.0,270.5 222.0,270.5 222.0,269.0 226.0,269.0 226.0,267.5 230.0,267.5 230.0,266.0 234.0,266.0 234.0,264.5 238.0,264.5 238.0,263.0 242.0,263.0 242.0,261.5 246.0,261.5 246.0,260.0 250.0,260.0 250.0,258.5 254.0,258.5 254.0,257.0 258.0,257.0 258.0,255.5 262.0,255.5 262.0,254.0 266.0,254.0 266.0,252.5 270.0,252.5 270.0,251.0 274.0,251.0 274.0,249.5 278.0,249.5 278.0,248.0 282.0,248.0 282.0,246.5 286.0,246.5 286.0,245.0 290.0,245.0 290.0,243.5 294.0,243.5 294.0,242.0 298.0,242.0 298.0,240.5 302.0,240.5 302.0,239.0 306.0,239.0 306.0,237.5 310.0,237.5 310.0,236.0 314.0,236.0 314.0,234.5 318.0,234.5 318.0,233.0 322.0,233.0 322.0,231.5 326.0,231.5 326.0,230.0 330.0,230.0 330.0,228.5 334.0,228.5 334.0,227.0 338.0,227.0 338.0,225.5 342.0,225.5 342.0,224.0 346.0,224.0 346.0,222.5 350.0,222.5 350.0,221.0 354.0,221.0 354.0,219.5 358.0,219.5 358.0,218.0 362.0,218.0 362.0,216.5 366.0,216.5 366.0,215.0 370.0,215.0 370.0,213.5 374.0,213.5 374.0,212.0 378.0,212.0 378.0,210.5 382.0,210.5 382.0,209.0 386.0,209.0 386.0,207.5 390.0,207.5 390.0,206.0 394.0,206.0 394.0,204.5 398.0,204.5 398.0,203.0 402.0,203.0 402.0,201.5 406.0,201.5 406.0,200.0 410.0,200.0 410.0,198.5 414.0,198.5 414.0,197.0 418.0,197.0 418.0,195.5 422.0,195.5 422.0,194.0 426.0,194.0 426.0,192.5 430.0,192.5 430.0,191.0 434.0,191.0 434.0,189.5 438.0,189.5 438.0,188.0 442.0,188.0 442.0,186.5 446.0,186.5 446.0,185.0 450.0,185.0 450.0,183.5 454.0,183.5 454.0,182.0 458.0,182.0 458.0,180.5 462.0,180.5 462.0,179.0 466.0,179.0 466.0,177.5 470.0,177.5 470.0,176.0 474.0,176.0 474.0,174.5 478.0,174.5 478.0,173.0 482.0,173.0 482.0,171.5 486.0,171.5 486.0,170.0 490.0,170.0 490.0,168.5 494.0,168.5 494.0,167.0 498.0,167.0 498.0,165.5 502.0,165.5 502.0,164.0 506.0,164.0 506.0,162.5 510.0,162.5 510.0,161.0 514.0,161.0 514.0,159.5 518.0,159.5 518.0,158.0 522.0,158.0 522.0,156.5 526.0,156.5 526.0,155.0 530.0,155.0 530.0,153.5 534.0,153.5 534.0,152.0 538.0,152.0 538.0,150.5 542.0,150.5 542.0,149.0 546.0,149.0 546.0,147.5 550.0,147.5 550.0,146.0 554.0,146.0 554.0,144.5 558.0,144.5 558.0,143.0 562.0,143.0 562.0,141.5 566.0,141.5 566.0,140.0 570.0,140.0 570.0,138.5 574.0,138.5 574.0,137.0 578.0,137.0 578.0,135.5 582.0,135.5 582.0,134.0 586.0,134.0 586.0,132.5 590.0,132.5 590.0,131.0 594.0,131.0 594.0,129.5 598.0,129.5 598.0,128.0 602.0,128.0 602.0,126.5 606.0,126.5 606.0,125.0 610.0,125.0 610.0,123.5 614.0,123.5 614.0,122.0 618.0,122.0 618.0,120.5 622.0,120.5 622.0,119.0 626.0,119.0 626.0,117.5 630.0,117.5 630.0,116.0 634.0,116.0 634.0,114.5 638.0,114.5 638.0,113.0 642.0,113.0 642.0,111.5 646.0,111.5 646.0,110.0 650.0,110.0 650.0,108.5 654.0,108.5 654.0,107.0 658.0,107.0 658.0,105.5 662.0,105.5 662.0,104.0 666.0,104.0 666.0,102.5 670.0,102.5 670.0,101.0 674.0,101.0 674.0,99.5 678.0,99.5 678.0,98.0 682.0,98.0 682.0,96.5 686.0,96.5 686.0,95.0 690.0,95.0"/>
<polyline fill="none" stroke="#6366f1" stroke-width="2.5" points="90.0,318.5 94.0,318.5 690.0,95.0"/>
<line x1="110" y1="22" x2="138" y2="22" stroke="#6366f1" stroke-width="3"/><text x="144" y="27" fill="#1e1b4b">Per second, 60 s min</text>
<line x1="330" y1="22" x2="358" y2="22" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="27" fill="#1e1b4b">Per minute</text>
<line x1="480" y1="22" x2="508" y2="22" stroke="#f97316" stroke-width="3"/><text x="514" y="27" fill="#1e1b4b">Full hour</text>
</svg>
<figcaption>Cost of one job at $0.40 per hour. Hourly billing (orange) charges the whole 40¢ step the moment a new hour starts; per-second and per-minute billing are almost the same line.</figcaption>
</figure>

The gap between the orange staircase and the blue line is what hourly rounding costs per job: largest just after each step, zero on exact hours.

Zoomed in on the first ten minutes, per-minute billing shows its steps, and the 60-second minimum shows as the flat start of the per-second line. Full-hour billing would be a flat line at 40¢, five times higher than the top of this chart.

<figure>
<svg viewBox="0 0 720 400" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Zoom on the first 10 minutes at 0.40 dollars per hour: per-second and per-minute billing, with full-hour billing off the scale</title>
<rect x="0" y="0" width="720" height="400" fill="#ffffff"/>
<line x1="90" y1="320.0" x2="690" y2="320.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="325.0" text-anchor="end" fill="#64748b" font-size="13">0¢</text>
<line x1="90" y1="252.5" x2="690" y2="252.5" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="257.5" text-anchor="end" fill="#64748b" font-size="13">2¢</text>
<line x1="90" y1="185.0" x2="690" y2="185.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="190.0" text-anchor="end" fill="#64748b" font-size="13">4¢</text>
<line x1="90" y1="117.5" x2="690" y2="117.5" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="122.5" text-anchor="end" fill="#64748b" font-size="13">6¢</text>
<line x1="90" y1="50.0" x2="690" y2="50.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="55.0" text-anchor="end" fill="#64748b" font-size="13">8¢</text>
<line x1="90.0" y1="320" x2="90.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="90.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<line x1="150.0" y1="320" x2="150.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="150.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">1</text>
<line x1="210.0" y1="320" x2="210.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="210.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">2</text>
<line x1="270.0" y1="320" x2="270.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="270.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">3</text>
<line x1="330.0" y1="320" x2="330.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="330.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">4</text>
<line x1="390.0" y1="320" x2="390.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="390.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">5</text>
<line x1="450.0" y1="320" x2="450.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="450.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">6</text>
<line x1="510.0" y1="320" x2="510.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="510.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">7</text>
<line x1="570.0" y1="320" x2="570.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="570.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">8</text>
<line x1="630.0" y1="320" x2="630.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="630.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">9</text>
<line x1="690.0" y1="320" x2="690.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="690.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">10</text>
<line x1="90" y1="320" x2="690" y2="320" stroke="#64748b" stroke-width="1.5"/>
<line x1="90" y1="50" x2="90" y2="320" stroke="#64748b" stroke-width="1.5"/>
<text x="390.0" y="365" text-anchor="middle" fill="#1e1b4b">Job length (minutes)</text>
<text x="22" y="185.0" text-anchor="middle" fill="#1e1b4b" transform="rotate(-90 22 185.0)">Cost at $0.40 per hour</text>
<polyline fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" points="90.0,297.5 150.0,297.5 150.0,275.0 210.0,275.0 210.0,252.5 270.0,252.5 270.0,230.0 330.0,230.0 330.0,207.5 390.0,207.5 390.0,185.0 450.0,185.0 450.0,162.5 510.0,162.5 510.0,140.0 570.0,140.0 570.0,117.5 630.0,117.5 630.0,95.0 690.0,95.0"/>
<polyline fill="none" stroke="#6366f1" stroke-width="2.5" points="90.0,297.5 150.0,297.5 690.0,95.0"/>
<text x="104" y="74" text-anchor="start" fill="#f97316">Full hour: $0.40 for any of these (off the chart)</text>
<line x1="110" y1="22" x2="138" y2="22" stroke="#6366f1" stroke-width="3"/><text x="144" y="27" fill="#1e1b4b">Per second, 60 s min</text>
<line x1="330" y1="22" x2="358" y2="22" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="27" fill="#1e1b4b">Per minute</text>
<line x1="480" y1="22" x2="508" y2="22" stroke="#f97316" stroke-width="3"/><text x="514" y="27" fill="#1e1b4b">Full hour</text>
</svg>
<figcaption>The first 10 minutes at $0.40 per hour. Both lines start at 0.67¢ because of the one-minute minimum. The per-minute line (green) is never more than 0.67¢ above the per-second line (blue).</figcaption>
</figure>

## A day of short jobs

Short jobs rarely come alone. Say you run 20 jobs in a working day, each 2 minutes 30 seconds, and start a fresh instance for each one.

- **Per second:** 20 × 150 s = 3,000 s, and 3,000 × 40 / 3,600 = 33.33¢.
- **Per minute, rounded up:** each job is 3 minutes, so 60 minutes in total: 40¢.
- **Full hour:** each job is a started hour: 20 × 40¢ = $8.00.

Hourly billing costs 24 times as much for the same 50 minutes of GPU work. The obvious workaround is to keep one machine running all day instead. Eight hours at $0.40 is $3.20, which beats $8.00 but is still 9.6 times the per-second bill, because you are now paying for the gaps between jobs.

That example flatters the fresh-instance approach, though, because it assumes a job starts the moment the machine does. It doesn't. As an illustration, suppose each launch spends 3 minutes booting, pulling an image and loading a model before the work starts (your number will differ). Per-second billing then charges 20 × 330 s = 6,600 s, which is 73.33¢, more than double the 33.33¢ of actual work. The increment is the same; the waste moved into setup.

On GPUFlow the same day looks a little different, because a rental is booked in whole hours and billed per second. Starting 20 separate rentals of 150 s each costs ceil(150 × 40 / 3,600) = ceil(1.67) = 2¢ each, so 40¢ in total. Rounding each rental up to a whole cent adds 0.33¢ per job here, which is where the extra 6.67¢ over the per-second total comes from. If the jobs are bunched together, note the limit of 10 new rentals per hour per user. Keeping one rental open all day costs the full wall-clock time, 8 hours = $3.20, because GPUFlow bills for time and does not charge per token.

## What matters more than the increment

Once jobs run longer than about ten minutes, per-second versus per-minute is a rounding error. These three things are not. They are covered in more detail in [the real cost of renting a GPU](/en/hidden-fees-in-gpu-rental/).

### Idle time

Every per-second platform bills a running instance whether the GPU is working or not. Lambda's docs say so directly: instances are billed "regardless if they're actively being used." The day of short jobs above shows the scale: 50 minutes of work, $3.20 if the machine stays up for 8 hours. No billing increment fixes a machine you forgot to stop.

### Setup time

Boot, image pulls and model downloads all happen on the meter. Lambda starts billing once the instance passes health checks, before your code has done anything. Per-second billing doesn't remove that cost; you pay it on every launch.

### Storage while stopped

Stopping a machine usually stops the GPU charge. The disk keeps billing. RunPod bills a stopped pod's volume disk at $0.20 per GB per month, double the running rate, and its docs warn that "storage charges continue to accrue on stopped Pods." Vast.ai says plainly that "stopping an instance does not avoid storage costs." A 100 GB volume left on a stopped RunPod pod costs 100 × $0.20 = $20 a month, which is 50 hours of GPU time at $0.40.

If your workload is calls to a model rather than your own code on a machine, compare against per-token pricing too: [hourly GPU or per-token API](/en/hourly-gpu-vs-per-token-api/) works through when each is cheaper.

## How GPUFlow bills: hold first, refund the rest

GPUFlow rents out inference: you get an OpenAI-compatible API key for a model running on someone's GPU, not a machine. There is no shell, disk or image to pay for, so storage and setup from the previous section don't apply. Idle time does: the rental is billed from start to end, busy or not.

The steps are:

1. You pick a listing and a whole number of hours (1 to 168 by default). The provider's hourly price is converted to whole cents.
2. At start, the full booked amount is held from your credits: rate in cents × hours. This is the whole amount, and it is taken up front.
3. When the rental ends, the charge is computed once: whole seconds used, at least 60, times the rate in cents, divided by 3,600, rounded up to the next cent, and never more than the hold.
4. Whatever is left of the hold returns to your available credits in the same step.

![The GPUFlow rent form for a $0.35 per hour GPU, with 2 hours entered, $0.70 held from credits, and the Start 2-hour rental button highlighted](../_images/screens/en/renter-rent.png)

The rent form shows the hold before you start: 2 hours at $0.35 holds $0.70.

### A worked example

Book 3 hours at $0.40. The hold is 40¢ × 3 = 120¢ ($1.20). You click **End now** after 38 minutes 20 seconds, which is 2,300 seconds.

- Charge: ceil(2,300 × 40 / 3,600) = ceil(25.56) = **26¢**.
- Returned to your credits: 120 − 26 = **94¢**.
- The platform fee is 12% of the charge, rounded to the nearest cent for each rental: round(26 × 0.12) = round(3.12) = 3¢. The provider gets 26 − 3 = 23¢, which is 88.5% of this charge rather than exactly 88%. On larger charges the rounding matters less.

<figure>
<svg viewBox="0 0 720 230" role="img" aria-labelledby="d3-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d3-title">A 120 cent hold for a 3-hour booking at 0.40 dollars per hour, ended after 38 minutes 20 seconds: 26 cents charged, 94 cents returned, and the 26 cents split into 23 cents for the provider and 3 cents for GPUFlow</title>
<rect x="0" y="0" width="720" height="230" fill="#ffffff"/>
<text x="60" y="30" fill="#1e1b4b">Held at start: 120¢ ($0.40 × 3 hours)</text>
<rect x="60" y="45" width="130" height="50" fill="#6366f1"/>
<rect x="190" y="45" width="470" height="50" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="125" y="76" text-anchor="middle" fill="#ffffff">26¢</text>
<text x="425" y="76" text-anchor="middle" fill="#1e1b4b">94¢ back to your credits</text>
<line x1="60" y1="95" x2="60" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="190" y1="95" x2="190" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="205" y="127" fill="#64748b">Charged for 38 min 20 s, then split</text>
<rect x="60" y="150" width="115" height="50" fill="#16a34a"/>
<rect x="175" y="150" width="15" height="50" fill="#f97316"/>
<text x="117" y="181" text-anchor="middle" fill="#ffffff">23¢</text>
<text x="205" y="172" fill="#1e1b4b">Provider: 23¢</text>
<text x="205" y="195" fill="#1e1b4b">GPUFlow fee: 3¢ (12% of 26¢, rounded)</text>
</svg>
<figcaption>The 120¢ hold from the example, drawn to scale: 26¢ charged for 38 min 20 s of use, 94¢ returned to credits, and the 26¢ split between the provider and GPUFlow.</figcaption>
</figure>

### When a rental ends without you

If the booked hours run out, a background job that runs every minute settles the rental. The charge is computed up to the booked end time, so you don't pay for any delay before the job runs. The API key stops working at the end time. If you want more time, **Add hours** holds more credits and keeps the same key.

If the provider's machine goes quiet, the rental ends too. The agent on the provider's machine sends a heartbeat every 15 seconds. After 10 minutes without one, the rental is ended and billed only up to the last heartbeat. At $0.40 an hour, a machine that drops out 25 minutes into a 3-hour booking costs ceil(1,500 × 40 / 3,600) = 17¢, and the other 103¢ of the 120¢ hold comes back.

There is a catch with whole-hour booking and the 61-minute job. If you book 1 hour and forget to click **Add hours** before it runs out, the key stops at 60 minutes and you pay 40¢ for an unfinished job. Book 2 hours (80¢ held) and end at 61 minutes, and you pay 41¢ and get 39¢ back. When in doubt, book long and end early; unused time costs nothing.

## Picking a billing model by job shape

- **Lots of jobs under 10 minutes:** per-second or per-minute billing, and check the minimum. Anything that rounds to the hour is the wrong tool here.
- **Jobs of 30 to 90 minutes:** avoid full-hour rounding (a 61-minute job pays for two hours). Per-second versus per-minute is worth under a cent a job.
- **Long runs of many hours:** the increment barely registers. Look at idle time, setup and storage instead.
- **Bursty calls to one model through the day:** a fresh machine per burst pays setup every time, and one machine kept up pays for the gaps. An inference rental that holds a model ready is one way to avoid the setup part, but the clock still runs between calls, so match the booking to when you actually work.

If you want to try it, the [GPUFlow marketplace](https://gpuflow.app/en/marketplace) lists hourly prices per GPU, and [what you need to rent a GPU](/en/what-you-need-to-rent-a-gpu/) covers the account and payment side.

## Sources

- AWS, Amazon EC2 On-Demand pricing (billing details): [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/)
- Google Cloud, VM instance pricing (billing model): [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Microsoft Azure, Linux Virtual Machines pricing (FAQ): [azure.microsoft.com/pricing/details/virtual-machines/linux](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)
- Lambda, Billing overview: [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/)
- RunPod, Pod pricing: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- Vast.ai, Billing reference: [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- GPUFlow docs, Credits, billing and refunds: [docs.gpuflow.app/renters/billing](https://docs.gpuflow.app/renters/billing/)

All checked in September 2026.
