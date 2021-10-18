import { Controller, Get, Logger, Param, Render } from '@nestjs/common'

@Controller('blog')
export class BlogsController {
  private logger = new Logger(BlogsController.name)

  //   constructor() {}

  @Get(':slug')
  @Render('pages/blog')
  blog(@Param('slug') slug: string) {
    this.logger.debug(slug)
    return {
      title: 'amamov | blog',
      contents: `<h1>header1</h1>
      <h2>header2</h2>
      <h3>header3</h3>
      <blockquote>
      <p>qqq qqq qqq qqq qqq qqq</p>
      </blockquote>
      <p>contentscontentscontentscontentscontentscontents<br>
      contentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontentscontents</p>
      <pre class="lang-python"><code data-language="python"><span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">"fuck"</span><span class="token punctuation">)</span>
      </code></pre>
      <iframe src="https://thumbs.gfycat.com/TerribleRashJaguar-mobile.mp4"></iframe>
      <p><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVM9suA3y0H3LqyZ8e878_xvDEVfV4mlJH-A&amp;usqp=CAU" alt="image" /></p>`,
    }
  }
}
