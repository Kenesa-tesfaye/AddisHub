import { useState } from 'react'
import { createResource } from '../../../api/resources'
import './Createresources.css'
import { FaEye, FaHeart } from 'react-icons/fa'
import { Link } from 'react-router'

const initialResource = {
    title: '',
    category: 'Education',
    location: 'Online',
    website: '',
    contact: '',
    description: '',
    image: null,
}

const initialVisibility = {
    feature: false,
    publishImmediately: false,
    showTitle: true,
    showCategory: true,
    showLocation: true,
    showWebsite: true,
}

function Createresources() {
    const [resource, setResource] = useState(initialResource)
    const [visibility, setVisibility] = useState(initialVisibility)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [status, setStatus] = useState({ message: '', type: '' })

    const categories = ['Education', 'Health', 'Support', 'Jobs', 'Events', 'Community']
    const locations = ['Online', 'Addis Ababa', 'Bole', 'Mexico', '6 Kilo', '4 Kilo']

    const handleResourceChange = (event) => {
        const { name, value } = event.target
        setResource((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) {
            setResource((prev) => ({ ...prev, image: null }))
            setPreviewUrl(null)
            return
        }
        setResource((prev) => ({ ...prev, image: file }))
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleVisibilityChange = (event) => {
        const { name, checked } = event.target
        setVisibility((prev) => ({ ...prev, [name]: checked }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setStatus({ message: '', type: '' })

        if (!resource.title.trim() || !resource.description.trim()) {
            setStatus({ message: 'Please provide both a title and description.', type: 'error' })
            return
        }

        setStatus({ message: 'Saving resource...', type: 'pending' })

        try {
            await createResource({
                ...resource,
                featured: visibility.feature,
                publishImmediately: visibility.publishImmediately,
            })
            setStatus({ message: 'Resource created successfully.', type: 'success' })
            setResource(initialResource)
            setVisibility(initialVisibility)
            setPreviewUrl(null)
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to create resource.'
            setStatus({ message, type: 'error' })
        }
    }

    return (
        <div className="create-resource-page">
            <header className="create-resource-header">
                <div>
                    <h2>Create Resource</h2>
                    <p>Separate input fields from visibility options so admins can preview before publishing.</p>
                </div>
            </header>

            <div className="create-resource-layout">
                <section className="resource-input-panel">
                    <div className="panel-header">
                        <h3>Resource details</h3>
                        <p>What the admin fills in</p>
                    </div>

                    <form className="resource-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={resource.title}
                                onChange={handleResourceChange}
                                placeholder="Enter resource title"
                            />
                        </div>

                        <div className="form-row split-row">
                            <div>
                                <label htmlFor="category">Category</label>
                                <select id="category" name="category" value={resource.category} onChange={handleResourceChange}>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="location">Location</label>
                                <select id="location" name="location" value={resource.location} onChange={handleResourceChange}>
                                    {locations.map((location) => (
                                        <option key={location} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={resource.description}
                                onChange={handleResourceChange}
                                placeholder="Describe how this resource helps the community"
                                rows={5}
                            />
                        </div>

                        <div className="form-row split-row">
                            <div>
                                <label htmlFor="website">Website / Link</label>
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    value={resource.website}
                                    onChange={handleResourceChange}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="contact">Contact</label>
                                <input
                                    id="contact"
                                    name="contact"
                                    type="text"
                                    value={resource.contact}
                                    onChange={handleResourceChange}
                                    placeholder="Email or phone"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label htmlFor="image">Image</label>
                            <div className="upload-area">
                                {previewUrl ? (
                                    <div className="image-preview">
                                        <img src={previewUrl} alt="Resource preview" />
                                        <button type="button" onClick={() => handleFileChange({ target: { files: [] } })}>
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-label">
                                        <span>Click to upload an image for card preview</span>
                                        <input id="image" type="file" accept="image/*" hidden onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {status.message && <div className={`status-message ${status.type}`}>{status.message}</div>}

                        <button type="submit" className="submit-button">
                            Create Resource
                        </button>
                    </form>
                </section>

                <section className="visibility-panel">
                    <div className="panel-header">
                        <h3>Visibility options</h3>
                        <p>How the resource will appear in cards before publishing</p>
                    </div>

                    <div className="visibility-settings">
                        <label className="checkbox-row">
                            <input type="checkbox" name="feature" checked={visibility.feature} onChange={handleVisibilityChange} />
                            Feature resource in top cards
                        </label>
                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                name="publishImmediately"
                                checked={visibility.publishImmediately}
                                onChange={handleVisibilityChange}
                            />
                            Publish immediately after creation
                        </label>
                        <div className="divider" />
                        <label className="checkbox-row">
                            <input type="checkbox" name="showTitle" checked={visibility.showTitle} onChange={handleVisibilityChange} />
                            Show title in preview card
                        </label>
                        <label className="checkbox-row">
                            <input type="checkbox" name="showCategory" checked={visibility.showCategory} onChange={handleVisibilityChange} />
                            Show category in preview card
                        </label>
                        <label className="checkbox-row">
                            <input type="checkbox" name="showLocation" checked={visibility.showLocation} onChange={handleVisibilityChange} />
                            Show location in preview card
                        </label>
                        <label className="checkbox-row">
                            <input type="checkbox" name="showWebsite" checked={visibility.showWebsite} onChange={handleVisibilityChange} />
                            Show website in preview card
                        </label>
                    </div>

                    <div className="preview-panel">
                        <div className="preview-header">
                            <h4>Card preview</h4>
                            <p>Live preview of the resource card.</p>
                        </div>





                        <div className="card">
                            <div className="profile-pic">
                               {previewUrl && <img src={previewUrl} alt="Resource preview" />}
                            </div>
                            <div className="bottom">
                                {visibility.showTitle && <h1>{resource.title || 'Resource title'}</h1>}
                                 <p className="description">
                                    {resource.description
                                        ? `${resource.description.slice(0, 120)}${resource.description.length > 120 ? '...' : ''}`
                                        : 'Resource description will appear here.'}
                                </p>
                                <div className="minors">
                                    {visibility.showCategory && <h3>{resource.category}</h3>}
                                    {visibility.showLocation && <h3>{resource.location}</h3>}
                                </div>
                                <div className="engagement">
                                    <div className="like">
                                        <FaHeart />
                                        <p>3k</p>
                                    </div>
                                    <div className="testimonials">
                                        <img src="" />
                                    </div>
                                    <div className="view">
                                       <FaEye/>
                                        <p>4M</p>
                                    </div>
                                </div>
                                <div className="view-detail">
                                    <Link >View Detail</Link>
                                </div>
                            </div>
                        </div>






                        
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Createresources
