const React = require('react')

function New (props) {
    return(
        <div>
            <h1>New Engineer Page</h1>
            <a href={`/engineers?token=${props.token}`}>Go back to Index Page</a>
            <form action={`/engineers?token=${props.token}`} method="POST">
                Name: <input type="text" name="name" /><br/>
                Speciality: <input type="text" name="specialty" /><br/>
                Years Experience: <input type="number" name="yearsExperience" /><br/>
                Available: <input type="checkbox" name="available" /><br/>
                <input type="submit" value="Create Engineer" />
            </form>
        </div>
    )
}

module.exports = New