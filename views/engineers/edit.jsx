const React = require('react')

function Edit (props) {
    const { name, _id, available, speciality, yearsExperience } = props.engineer
    return(
        <div>
            <h1>{name} Edit Page</h1>
            <a href='/engineers'>Go back to Index Page</a>
            <form action={`/engineers/${_id}?_method=PUT&token=${props.token}`} method="POST">
                Name: <input type="text" name="name" defaultValue={name} /><br/>
                Speciality: <input type="text" name="speciality" defaultValue={speciality}/><br/>
                Years Experience: <input type="number" name="yearsExperience" defaultValue={yearsExperience}/><br/>
                Available: {available? <input type="checkbox" name="available" defaultChecked />: <input type='checkbox' name="available"/>}<br/>
                <input type="submit" value="Update Engineer" />
            </form>
        </div>
    )
}

module.exports = Edit