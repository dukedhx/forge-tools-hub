<template>
  <section class="main-container">
    <b-modal :active.sync="disclaimerModal">
      <b-message title="Disclaimer" type="is-info" :closable="false">
        <pre>
          /////////////////////////////////////////////////////////////////////
          // Copyright (c) 2020. All rights reserved
          // Written by Bryan Huang, Forge Partner Development, Autodesk
          //
          // Permission to use, copy, modify, and distribute this software in
          // object code form for any purpose and without fee is hereby granted,
          // provided that this copyright notice appears in all copies and
          // that both that copyright notice and the limited warranty and
          // restricted rights notice below appear in all supporting
          // documentation.
          //
          // THE AUTHOR PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
          // THE AUTHOR SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
          // MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE. THE AUTHOR
          // DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
          // UNINTERRUPTED OR ERROR FREE.
          /////////////////////////////////////////////////////////////////////
        </pre>
      </b-message>
    </b-modal>
    <b-modal :active.sync="showSettings">
      <b-message title="Settings" type="is-info" :closable="false">
        <b-field
          horizontal
          label="Animated Background"
          message="Toggle animated background"
        >
          <b-switch v-model="animatedBackground">
            {{ animatedBackground ? 'ON' : 'OFF' }}
          </b-switch>
        </b-field>

        <b-field horizontal>
          <p class="control">
            * Requires page refresh to take effect ...
          </p>
        </b-field>
      </b-message>
    </b-modal>
    <b-modal :active.sync="showAbout">
      <div class="card" style="position: relative;min-height: 250px">
        <div class="card-image">
          <figure class="image">
            <img
              style="width:100%;height:auto"
              src="https://i.imgur.com/9tzuBkF.jpg"
              alt="Placeholder image"
            />
          </figure>
        </div>
        <div
          class="card-content"
          style="bottom: 5px;overflow: auto;
                 max-height: 100%;
                 background: rgba(255,255,255,0.8);
                 position: absolute;"
        >
          <div class="media">
            <div class="media-left">
              <figure class="image is-48x48">
                <img
                  src="https://flint-prodcms-forge.s3.amazonaws.com/prod/s3fs-public/styles/avatar_medium_x2/public/2019-02/img_0180.jpg?itok=Y8w2EWlX"
                  alt="Placeholder image"
                />
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">Bryan Huang</p>
              <p class="subtitle is-6">
                <a href="https://github.com/dukedhx/" target="_blank"
                  >@dukedhx</a
                >
              </p>
            </div>
          </div>

          <div class="content">
            <section>
              Bryan Huang is a Developer Advocate with Autodesk Developer
              Network and is a certified AWS/Azure Solutions Architect/Developer
              and VMware Practitioner. His other qualifications include PMP,
              PMI-ACP, NAATI Certified Intepreter and he is based in Shanghai,
              China (by day) & Melbourne, Australia (for winter seasons ;p).
            </section>
            <section>
              <div style="float:right">
                <a href="https://github.com/dukedhx/" target="_blank"
                  ><b-icon icon="github-box"></b-icon
                ></a>
                <a
                  href="https://forge.autodesk.com/author/bryan-huang"
                  target="_blank"
                  ><b-icon icon="blogger"></b-icon
                ></a>
                <a
                  href="https://www.linkedin.com/in/bryan-huang-1447b862"
                  target="_blank"
                  ><b-icon icon="linkedin"></b-icon
                ></a>
                <a
                  href="https://stackoverflow.com/users/3006933/brian-huang"
                  target="_blank"
                  ><b-icon icon="facebook"></b-icon
                ></a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </b-modal>
    <b-navbar class="navigation-header">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <img src="~assets/forge.png" alt="Buefy" height="28" />
        </b-navbar-item>
      </template>

      <template slot="start">
        <b-navbar-item>
          {{ title }}
        </b-navbar-item>
      </template>
      <template slot="end">
        <b-navbar-item>
          <b-button type="is-text" size="is-small" @click="open('/', '_self')"
            ><b-icon icon="home"></b-icon
          ></b-button>
          <b-button
            type="is-text"
            size="is-small"
            @click="open('https://github.com/dukedhx/forge-tools-hub')"
            ><b-icon icon="github-circle"></b-icon
          ></b-button>

          <b-button
            type="is-text"
            size="is-small"
            @click="open('http://tiny.cc/nrwujz')"
            ><b-icon icon="help-circle"></b-icon
          ></b-button>
          <b-button type="is-text" size="is-small" @click="showSettings = true"
            ><b-icon icon="settings"></b-icon
          ></b-button>
        </b-navbar-item>
        <b-navbar-item> </b-navbar-item>
      </template>
    </b-navbar>
    <section class="main-content columns">
      <div class="container column is-10">
        <nuxt />
      </div>
    </section>
    <section class="corner-footer">
      <b-tag type="is-dark"
        ><a href="#" @click="showAbout = true" class="has-text-white"
          >About Author © {{ new Date().getFullYear() }}</a
        ></b-tag
      >
    </section>
    <canvas class="bgCanvas" ref="bgCanvas" :style="bgCanvasStyles"></canvas>
  </section>
</template>
<style>
html {
  background: #191919;
}
@keyframes slideleft {
  to {
    left: 0;
  }
}
@keyframes slideright {
  to {
    right: 0px;
  }
}
</style>
<style lang="scss" scoped>
.bgCanvas {
  position: fixed;
  z-index: -233;
  top: 0;
  left: 0;
  background-color: black;
}

.navigation-header {
  &::v-deep .navbar-burger {
    display: none;
  }
  background: rgba(0, 0, 0, 0.3);
  position: relative;
  .navbar-brand .navbar-item,
  .navbar-end .navbar-item {
    background: #ffdd57;
  }
  .navbar-end {
  }
  &::v-deep .navbar-menu {
    position: relative;

    .navbar-start {
      animation: 1s 1s slideleft forwards;
      position: absolute;
      z-index: -233;
      left: -100%;
      height: 52px;
    }

    .navbar-start .navbar-item {
      color: #fff;
      background-color: #7a7a7a;
    }

    .navbar-end {
      position: absolute;
      animation: 1s 1s slideright forwards;

      right: -200px;
      height: 52px;
    }
  }
}

.main-container {
  min-height: calc(100vh - 5px);
  position: relative;
  .main-content {
    margin-bottom:0;
    position: relative;
  }
  .container{padding-bottom:0}
  .corner-footer {
    position:absolute;
    bottom:5px;
    right:5px
  }
}
</style>

<script>
export default {
  methods: {
    open(url, target) {
      window.open(url, target)
    },
    startBg() {
      this.bgInit = true
      const bgCanvas = this.$refs.bgCanvas
      let w = (bgCanvas.width = window.innerWidth),
        h = (bgCanvas.height = window.innerHeight),
        ctx = bgCanvas.getContext('2d'),
        minDist = 10,
        maxDist = 30,
        initialWidth = 10,
        maxLines = 100,
        initialLines = 4,
        speed = 5,
        lines = [],
        frame = 0,
        timeSinceLast = 0,
        dirs = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
          [0.7, 0.7],
          [0.7, -0.7],
          [-0.7, 0.7],
          [-0.7, -0.7]
        ],
        starter = {
          x: w / 2,
          y: h / 2,
          vx: 0,
          vy: 0,
          width: initialWidth
        }

      function init() {
        lines.length = 0

        for (var i = 0; i < initialLines; ++i) lines.push(new Line(starter))

        ctx.fillStyle = '#222'
        ctx.fillRect(0, 0, w, h)
      }
      function getColor(x) {
        return 'hsl( hue, 80%, 50% )'.replace('hue', (x / w) * 360 + frame)
      }
      function anim() {
        window.requestAnimationFrame(anim)

        ++frame

        ctx.shadowBlur = 0
        ctx.fillStyle = 'rgba(0,0,0,.02)'
        ctx.fillRect(0, 0, w, h)
        ctx.shadowBlur = 0.5

        for (var i = 0; i < lines.length; ++i)
          if (lines[i].step()) {
            lines.splice(i, 1)
            --i
          }

        ++timeSinceLast

        if (
          lines.length < maxLines &&
          timeSinceLast > 10 &&
          Math.random() < 0.5
        ) {
          timeSinceLast = 0

          lines.push(new Line(starter))

          ctx.fillStyle = ctx.shadowColor = getColor(starter.x)
          ctx.beginPath()
          ctx.arc(starter.x, starter.y, initialWidth, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      function Line(parent) {
        this.x = parent.x | 0
        this.y = parent.y | 0
        this.width = parent.width / 1.25

        do {
          let dir = dirs[(Math.random() * dirs.length) | 0]
          this.vx = dir[0]
          this.vy = dir[1]
        } while (
          (this.vx === -parent.vx && this.vy === -parent.vy) ||
          (this.vx === parent.vx && this.vy === parent.vy)
        )

        this.vx *= speed
        this.vy *= speed

        this.dist = Math.random() * (maxDist - minDist) + minDist
      }
      Line.prototype.step = function() {
        let dead = false

        let prevX = this.x,
          prevY = this.y

        this.x += this.vx
        this.y += this.vy

        --this.dist

        if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) dead = true

        if (this.dist <= 0 && this.width > 1) {
          this.dist = Math.random() * (maxDist - minDist) + minDist

          if (lines.length < maxLines) lines.push(new Line(this))
          if (lines.length < maxLines && Math.random() < 0.5)
            lines.push(new Line(this))

          if (Math.random() < 0.2) dead = true
        }

        ctx.strokeStyle = ctx.shadowColor = getColor(this.x)
        ctx.beginPath()
        ctx.lineWidth = this.width
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(prevX, prevY)
        ctx.stroke()

        if (dead) return true
      }

      init()
      anim()

      window.addEventListener('resize', function() {
        w = bgCanvas.width = window.innerWidth
        h = bgCanvas.height = window.innerHeight
        starter.x = w / 2
        starter.y = h / 2

        init()
      })
    }
  },
  data() {
    return {
      showAbout: false,
      disclaimerModal: false,
      bgInit: false,
      animatedBackground: false,
      showSettings: false
    }
  },
  watch: {
    animatedBackground(val) {
      if (val) {
        if (!this.bgInit) this.startBg()
        localStorage.removeItem('sb233.noAnimatedBackground')
      } else localStorage.setItem('sb233.noAnimatedBackground', val)
    }
  },
  computed: {
    bgCanvasStyles() {
      return { visibility: this.animatedBackground ? 'initial' : 'hidden' }
    },
    title() {
      return this.$store.state.title
    }
  },
  mounted() {
    this.animatedBackground = !!!localStorage.getItem(
      'sb233.noAnimatedBackground'
    )
    if (this.animatedBackground) this.startBg()
    this.$buefy.snackbar.open({
      message: 'By continuing, you agree to the terms and conditions here:',
      type: 'is-warning',
      position: 'is-bottom',
      actionText: 'Read More',
      onAction: () => (this.disclaimerModal = true)
    })
  }
}
</script>
