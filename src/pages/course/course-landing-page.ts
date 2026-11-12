import { SitePage } from '../site-page';

/** A course sales page on course.akashayogaacademy.com (e.g. /200h-essential). */
export class CourseLandingPage extends SitePage {
  /**
   * The first visible button that starts a purchase. Matched by link target, not by text,
   * because the wording changes per page ("Enroll Now", "Secure my spot", "Join"…).
   */
  readonly enrollButton = this.page.locator('a[href*="/checkout?product="]:visible, a[href$="/enroll"]:visible').first();

  async enrollButtonText() {
    return (await this.enrollButton.innerText()).trim();
  }
}
