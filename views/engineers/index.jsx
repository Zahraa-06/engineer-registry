const React = require('react')

function Index (props){
    const engineers = props.engineers
    return (
        <div>
        <h1>Index page</h1>
        <a href={`/engineers/new?token=${props.token}`}>Create A New Engineer</a>
        <ul>
        {
            engineers.map((engineer) => {
                return (<li>this is <a href={`/engineers/${engineer.id}?token=${props.token}`}>{engineer.name}</a>of the speciality {engineer.speciality} with {engineer.yearsExperience} years of experience</li>)
            })
        }
        </ul>
        </div>
    )
}

module.exports = Index