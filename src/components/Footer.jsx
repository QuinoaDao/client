import "./Footer.css"
export const Footer = () => {
    return(
        <footer id="footer_wrap">
        <div className="qui_footer">
          <a className="footer_txtBtn">Docs</a>
          <a className="footer_txtBtn">Governance</a>
          <a className="channel_link twitter" href="https://twitter.com/QuinoaProtocol" target="_blank" rel="noopener noreferrer">a</a>
          <a className="channel_link telegram">a</a>
          <a className="channel_link discord" href="https://discord.gg/uwF8MmUjMk" target="_blank" rel="noopener noreferrer">a</a>
          <a className="coachBtn" href="mailto:quinoa.protocol@gmail.com">need help?</a>
        </div>
      </footer>
    )
}