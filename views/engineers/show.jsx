const React = require('react')

const styles = {
    backgroundColor: 'lightblue'
}

function Show(props){
    return(
        <div style={styles}>
            <h1>{props.engineer.name}</h1>
            <a href={`/engineers/?token=${props.token}`}>Go back to Index Page</a>
            <p>
                {props.engineer.name} is a {props.engineer.speicality} engineer with {props.engineer.yearsExperience} years of experience and 
                {props.engineer.available? 'They are available': 'They are not available'}
            </p>
              <form action={`/engineers/${props.engineer._id}?_method=DELETE&token=${props.token}`} method="POST">
                <input type="submit" value={`Delete this ${props.engineer.name}`}/>
            </form>
            <div>
            <a href={`/engineers/${props.engineer._id}/edit?token=${props.token}`}><button>{`Edit this ${props.engineer.name}`}</button></a>
            </div>
        </div>
    )
}

module.exports = Show