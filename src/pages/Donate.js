import React from 'react';

export default () => (
    <div className="page">
        <div className="page-content Donate" lang="en">
            <h2>Thanks!</h2>
            <hr />
            <p>
                I think personal productivity is much more than getting things done, it's about beating yourself everyday and doing more with less. Among the tools I have tested, Todoist is from far the best  personal productivity tool, and with BurndownChartist it's intented to be the best on professional productivity too.
            </p>
            <p>
                I encourage you to take a look at the great <a target="_blank" rel="noopener noreferrer" href="http://kanban.ist">kanban.ist</a>, by <a target="_blank" rel="noopener noreferrer" href="https://github.com/mwakerman/">Misha Wakerman</a>, which inspired and laid the foundations of BurndownChartist. Kanban.ist converts your Todoist list into a Kanban Dashboard, and it is a milestone if you use Kanban at work and Todoist at home.
            </p>
            <br/>
            <p>
                BurndownChartist was made as a hobby and a side-project, and I wish it could be useful for someone else.
            </p>
            <p>
                Any annoying bug? <a href="mailto:m.varona@bmsalamanca.com?subject=Bug%20found%20on%20BurndownChartist">
                    Let me know!
                </a>{' '}
                <br/>
                Any feature you would love to have? <a href="mailto:m.varona@bmsalamanca.com?subject=Feature%20request%20for%20BurndownChartist">
                    Let me think about it!
                </a>
            </p>
            <br/>
            <p>
                Mario Varona
            </p>
            <hr />
            <h6>PayPal</h6>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                <input type="hidden" name="cmd" value="_s-xclick" />
                <input type="hidden" name="hosted_button_id" value="HPFH9LRU5WV8N" />
                <input type="image" src="https://www.paypalobjects.com/en_US/ES/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                <img alt="" border="0" src="https://www.paypal.com/en_ES/i/scr/pixel.gif" width="1" height="1" />
            </form>
            <hr />
            <h6>Other ways to support BurndownChartist</h6>
            <a href="https://twitter.com/home?status=Checkout%20BurndownChartist:%20A%20burndown%20chart%20for%20Todoist!%20https://BurndownChartist.com" target="_blank" rel="noopener noreferrer">
                        Tweet support!
                    </a>
        </div>
    </div>
);
