/**
 * @jest-environment jsdom
 * 
 * Tests updated for version 2.0.8
 */

const { test } = require("@jest/globals");
const { HyperaudioLite } = require("../js/hyperaudio-lite");
//import * as HyperaudioLite from '../js/hyperaudio-lite';

let wordArr = [];
let ht = null;

function createWordArrayResult(words) {
  for (let i = 0; i < words.length; ++i) {
    const m = parseInt(words[i].getAttribute("data-m"));
    let p = words[i].parentNode;
    while (p !== document) {
      if (
        p.tagName.toLowerCase() === "p" ||
        p.tagName.toLowerCase() === "figure" ||
        p.tagName.toLowerCase() === "ul"
      ) {
        break;
      }
      p = p.parentNode;
    }
    wordArr[i] = { n: words[i], m: m, p: p };
  }

  for (let i = 0; i < wordArr.length; ++i) {
    wordArr[i].n.classList.add("unread");
  }

  return wordArr;
}

function simulateClick(elem, clickType) {
  // Create our event (with options)
  let evt = new MouseEvent(clickType, {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  // If cancelled, don't dispatch our event
  let cancelled = !elem.dispatchEvent(evt);
}

document.body.innerHTML =
  '<audio id="hyperplayer" class="hyperaudio-player" src="test.mp3" type="audio/mp3"></audio>' +
  '<div id="hypertranscript" class="hyperaudio-transcript">' +
  "<article>" +
  "<section>" +
  '<p id="p1" data-wm="payment-pointer"><span class="read" data-m="880" data-d="539">test </span><span class="read" data-m="2560" data-d="459">one </span><span class="read" data-m="3240" data-d="370">two </span><span class="read" data-m="3950" data-d="410">three </span><span class="read" data-m="4750" data-d="459">four </span></p>' +
  '<p class="active"><span class="read" data-m="6580" data-d="530">test </span><span class="read active" data-m="8099" data-d="439">five </span><span class="unread" data-m="8740" data-d="509">six </span><span class="unread" data-m="9469" data-d="540">seven </span><span class="unread" data-m="10280" data-d="330">eight </span></p>' +
  "</section>" +
  "</article>" +
  "<div>";

window.HTMLMediaElement.prototype.play = () => {
  /* does nothing */
};

test("instantiation - options false", () => {
  let minimizedMode = false;
  let autoScroll = false;
  let doubleClick = false;
  let webMonetization = false;

  ht = new HyperaudioLite(
    "hypertranscript",
    "hyperplayer",
    minimizedMode,
    autoScroll,
    doubleClick,
    webMonetization
  );
});

test("createWordArray", () => {
  const words = document.querySelectorAll("[data-m]");
  const expectedResult = createWordArrayResult(words);

  expect(ht.createWordArray(words)).toStrictEqual(expectedResult);
});

test("getSelectionMediaFragment", () => {
  document
    .getSelection()
    .setBaseAndExtent(
      document.getElementById("p1").firstChild.lastChild,
      0,
      document.getElementById("p1").lastChild.lastChild,
      3
    );
  expect(ht.getSelectionMediaFragment()).toStrictEqual(
    "hypertranscript=0.9,5.3"
  );
});

test("updateTranscriptVisualState", () => {
  const expectedResult = {
    currentWordIndex: 7,
    currentParaIndex: 1,
  };

  ht.currentTime = 8.106641;

  expect(ht.updateTranscriptVisualState(ht.currentTime)).toStrictEqual(expectedResult);
});

test("media playback - click on word", () => {
  simulateClick(document.getElementsByTagName("span")[3], "click");
  expect(ht.player.currentTime).toStrictEqual(3.95);
});

test("instantiation - doubleClick true", () => {
  let minimizedMode = false;
  let autoScroll = false;
  let doubleClick = true;
  let webMonetization = false;

  ht = new HyperaudioLite(
    "hypertranscript",
    "hyperplayer",
    minimizedMode,
    autoScroll,
    doubleClick,
    webMonetization
  );
});

test("media playback - doubleClick on word", () => {
  simulateClick(document.getElementsByTagName("span")[4], "dblclick");
  expect(ht.player.currentTime).toStrictEqual(4.75);
});

test("instantiation - webMonetization true", () => {
  let minimizedMode = false;
  let autoScroll = false;
  let doubleClick = false;
  let webMonetization = true;

  ht = new HyperaudioLite(
    "hypertranscript",
    "hyperplayer",
    minimizedMode,
    autoScroll,
    doubleClick,
    webMonetization
  );
});

test("media playback - payment pointer inserted", () => {
  simulateClick(document.getElementsByTagName("span")[4], "click");
  const paymentPointer = document.querySelector('[name="monetization"]');

  expect(paymentPointer.content).toStrictEqual("payment-pointer");
});
