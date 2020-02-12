<template>
  <section class="section">
    <div class="tile is-ancestor">
      <div class="tile is-vertical is-8">
        <div class="tile">
          <div class="tile is-parent">
            <article class="tile is-child box">
              <nuxt-link to="svfsaver" exact-active-class="is-active">
                <p class="title">SVF Saver</p>
                <p class="subtitle">Download SVF files for an extracted model from Forge with Service Worker capturing the derivatives as Viewer renders the model</p>
                <p class="icon-holder">
                  <b-icon size="is-medium" icon="camcorder"></b-icon>
                </p>
              </nuxt-link>
            </article>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child box">
              <nuxt-link
                to="downloader"
                exact-active-class="is-active"
              >
                <p class="title">Downloader</p>
                <p class="subtitle">Download a derivative or any web resource in chunks (so the request won't get timed out) and in parallel for better efficiency</p>
                <p class="icon-holder">
                  <b-icon size="is-medium" icon="attachment"></b-icon>
                </p>
              </nuxt-link>
            </article>
          </div>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child box">
            <nuxt-link to="requester" exact-active-class="is-active">
              <p class="title">HTTP Requester</p>
              <p class="subtitle">Effortlessly make any (browser supported) HTTP requests to execute simple tasks like access tokens, model translation etc ...</p>
              <p class="icon-holder">
                <b-icon size="is-medium" icon="web"></b-icon>
              </p>
            </nuxt-link>
          </article>
        </div>
      </div>
      <div class="tile is-parent">
        <article class="tile is-child box">
          <nuxt-link to="derivativedownloader" exact-active-class="is-active">
            <p class="title">Derivative Downloader</p>
            <p class="subtitle">Parse a derivative manifest for an extracted model on Forge and download selected derivatives (SVF or other supported formats)</p>
            <figure class="image is-4by3">
              <img src="~assets/downloader.gif">
            </figure>
            <p class="icon-holder">
              <b-icon size="is-medium" icon="download"></b-icon>
            </p>
          </nuxt-link>
        </article>
      </div>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-vertical is-4">
        <div class="tile is-parent">
          <article class="tile is-child box">
            <nuxt-link to="pwa" exact-active-class="is-active">
              <p class="title">PWA</p>
              <p class="subtitle">Cache and view models offline - PWA ready</p>
              <figure class="image is-4by3">
                <img src="~assets/pwa.gif">
              </figure>
              <p class="icon-holder">
                <b-icon size="is-medium" icon="cellphone-link"></b-icon>
              </p>
            </nuxt-link>
          </article>
        </div>
      </div>
      <div class="tile is-vertical is-8">
        <div class="tile">
          <div class="tile is-parent">
            <article class="tile is-child box">
              <nuxt-link to="uploader" exact-active-class="is-active">
                <p class="title">Uploader</p>
                <p class="subtitle">Upload an object in paralleled chunks - requires the recipient service to explicitly expose forbidden headers if needed</p>
                <p class="icon-holder">
                  <b-icon size="is-medium" icon="briefcase-upload"></b-icon>
                </p>
              </nuxt-link>
            </article>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child box">
              <nuxt-link
                to="optionsgenerator"
                exact-active-class="is-active"
              >
                <p class="title">Viewer Options Generator</p>
                <p class="subtitle">Generate all possibile Viewer init/load options such as transform metrics easily ...</p>
                <p class="icon-holder">
                  <b-icon size="is-medium" icon="power-settings"></b-icon>
                </p>
              </nuxt-link>
            </article>
          </div>
        </div>

        <div class="tile is-parent">
          <article class="tile is-child box">
            <nuxt-link to="tutorial" exact-active-class="is-active">
              <p class="title">Tutorial/Playground</p>
              <p class="subtitle">Curated collection of interactive Forge tutorials & playgrounds</p>
              <p class="icon-holder">
                <b-icon size="is-medium" icon="animation-play"></b-icon>
              </p>
            </nuxt-link>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
<style>
@keyframes fadein {
  to {
    opacity: 1;
  }
}
</style>
<style lang="scss" scoped>
.section {
  &::v-deep article.tile {
    position: relative;
    animation: 2s 2s fadein forwards;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0.6);
    box-shadow: 1px 1px 1px 1px #ffdd57;
    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
      box-shadow: none;
    }
    .title {
      color: #ffdd57;
    }
    .subtitle {
      color: #dbdbdb;
      padding-right: 30px;
    }
    .icon-holder {
      right: 10px;
      color: #ffdd57;
      position: absolute;
      top: 25px;
    }
  }
}
</style>
