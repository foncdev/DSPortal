// app/src/pages/ComponentsDemo.tsx
import React, { useState } from 'react';
import {
    Button,
    TextField,
    Select,
    Modal,
    ModalFooter,
    Badge,
    Label,
    SelectOption
} from '@ds/ui';
import {
    Search,
    Bell,
    Sun,
    Lock,
    Mail,
    User,
    ChevronRight,
    Settings,
    AlertCircle,
    Download,
    Calendar,
    Check,
    X,
    Copy
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import './ComponentsDemo.scss';

const ComponentsDemo: React.FC = () => {
    const { t } = useTranslation();

    // State for the interactive components
    const [textValue, setTextValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [selectValue, setSelectValue] = useState('option2');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Select options
    const selectOptions: SelectOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
        { value: 'option4', label: 'Option 4', disabled: true },
    ];

    // Component section renderer
    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="demo-section">
            <h2 className="demo-section-title">{title}</h2>
            <div className="demo-section-content">
                {children}
            </div>
        </div>
    );

    return (
        <div className="components-demo">
            <h1 className="demo-title">DS UI Component Library</h1>
            <p className="demo-description">
                This page demonstrates all the available components in the @ds/ui library.
            </p>

            {/* Buttons Section */}
            <Section title="Buttons">
                <div className="demo-grid">
                    <div className="demo-item">
                        <h3>Variants</h3>
                        <div className="demo-buttons">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                            <Button variant="success">Success</Button>
                            <Button variant="warning">Warning</Button>
                            <Button variant="danger">Danger</Button>
                        </div>
                    </div>

                    <div className="demo-item">
                        <h3>Sizes</h3>
                        <div className="demo-buttons">
                            <Button size="sm">Small</Button>
                            <Button>Medium (Default)</Button>
                            <Button size="lg">Large</Button>
                        </div>
                    </div>

                    <div className="demo-item">
                        <h3>States</h3>
                        <div className="demo-buttons">
                            <Button>Default</Button>
                            <Button disabled>Disabled</Button>
                            <Button loading>Loading</Button>
                        </div>
                    </div>

                    <div className="demo-item">
                        <h3>With Icons</h3>
                        <div className="demo-buttons">
                            <Button icon={<Search size={16} />}>Search</Button>
                            <Button icon={<Download size={16} />} iconPosition="right">Download</Button>
                            <Button variant="outline" icon={<Settings size={16} />} />
                        </div>
                    </div>
                </div>
            </Section>

            {/* Text Fields Section */}
            <Section title="Text Fields">
                <div className="demo-grid">
                    <div className="demo-item">
                        <h3>Basic</h3>
                        <TextField
                            label="Text Input"
                            placeholder="Enter some text..."
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                        />
                    </div>

                    <div className="demo-item">
                        <h3>With Icon</h3>
                        <TextField
                            label="Search"
                            placeholder="Search..."
                            icon={<Search size={18} />}
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Password</h3>
                        <TextField
                            type="password"
                            label="Password"
                            placeholder="Enter password"
                            value={passwordValue}
                            onChange={(e) => setPasswordValue(e.target.value)}
                        />
                    </div>

                    <div className="demo-item">
                        <h3>With Helper Text</h3>
                        <TextField
                            label="Email"
                            placeholder="Enter email"
                            icon={<Mail size={18} />}
                            helperText="We'll never share your email with anyone else."
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Error State</h3>
                        <TextField
                            label="Username"
                            placeholder="Enter username"
                            error="Username is already taken"
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Success State</h3>
                        <TextField
                            label="Verification Code"
                            placeholder="Enter code"
                            success
                            helperText="Verification code is valid"
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Disabled</h3>
                        <TextField
                            label="Disabled Input"
                            placeholder="You can't edit this"
                            disabled
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Sizes</h3>
                        <div className="field-group">
                            <TextField
                                label="Small"
                                placeholder="Small input"
                                size="sm"
                            />
                            <TextField
                                label="Medium (Default)"
                                placeholder="Medium input"
                            />
                            <TextField
                                label="Large"
                                placeholder="Large input"
                                size="lg"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* Select Section */}
            <Section title="Select">
                <div className="demo-grid">
                    <div className="demo-item">
                        <h3>Basic</h3>
                        <Select
                            label="Select Option"
                            options={selectOptions}
                            value={selectValue}
                            onChange={(value) => setSelectValue(value.toString())}
                        />
                    </div>

                    <div className="demo-item">
                        <h3>With Placeholder</h3>
                        <Select
                            label="Select Option"
                            options={selectOptions}
                            placeholder="Choose an option..."
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Error State</h3>
                        <Select
                            label="Select Option"
                            options={selectOptions}
                            error="Please select an option"
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Success State</h3>
                        <Select
                            label="Select Option"
                            options={selectOptions}
                            value="option1"
                            success
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Disabled</h3>
                        <Select
                            label="Select Option"
                            options={selectOptions}
                            disabled
                        />
                    </div>

                    <div className="demo-item">
                        <h3>Sizes</h3>
                        <div className="field-group">
                            <Select
                                label="Small"
                                options={selectOptions}
                                size="sm"
                            />
                            <Select
                                label="Medium (Default)"
                                options={selectOptions}
                            />
                            <Select
                                label="Large"
                                options={selectOptions}
                                size="lg"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* Labels Section */}
            <Section title="Labels">
                <div className="demo-grid">
                    <div className="demo-item">
                        <h3>Basic</h3>
                        <Label htmlFor="demo-input">Standard Label</Label>
                        <input id="demo-input" className="demo-input" />
                    </div>

                    <div className="demo-item">
                        <h3>Required</h3>
                        <Label htmlFor="required-input" required>Required Label</Label>
                        <input id="required-input" className="demo-input" />
                    </div>

                    <div className="demo-item">
                        <h3>Disabled</h3>
                        <Label htmlFor="disabled-input" disabled>Disabled Label</Label>
                        <input id="disabled-input" className="demo-input" disabled />
                    </div>
                </div>
            </Section>

            {/* Badges Section */}
            <Section title="Badges">
                <div className="demo-grid">
                    <div className="demo-item">
                        <h3>Variants</h3>
                        <div className="demo-badges">
                            <Badge variant="primary">Primary</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="warning">Warning</Badge>
                            <Badge variant="danger">Danger</Badge>
                        </div>
                    </div>

                    <div className="demo-item">
                        <h3>Outline</h3>
                        <div className="demo-badges">
                            <Badge variant="primary" outline>Primary</Badge>
                            <Badge variant="secondary" outline>Secondary</Badge>
                            <Badge variant="success" outline>Success</Badge>
                            <Badge variant="warning" outline>Warning</Badge>
                            <Badge variant="danger" outline>Danger</Badge>
                        </div>
                    </div>

                    <div className="demo-item">
                        <h3>Sizes</h3>
                        <div className="demo-badges">
                            <Badge size="sm">Small</Badge>
                            <Badge>Medium (Default)</Badge>
                            <Badge size="lg">Large</Badge>
                        </div>
                    </div>

                    <div className="demo-item">
                        <h3>Rounded (Pill)</h3>
                        <div className="demo-badges">
                            <Badge rounded>Default</Badge>
                            <Badge variant="success" rounded>Success</Badge>
                            <Badge variant="danger" rounded>Danger</Badge>
                        </div>
                    </div>

                    <div className="demo-item">
                        <h3>With Dot</h3>
                        <div className="demo-badges">
                            <Badge variant="primary" dot>Active</Badge>
                            <Badge variant="success" dot>Online</Badge>
                            <Badge variant="danger" dot>Offline</Badge>
                            <Badge variant="warning" dot>Away</Badge>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Modals Section */}
            <Section title="Modals">
                <div className="demo-grid">
                    <div className="demo-item">
                        <h3>Basic Modal</h3>
                        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Example Modal"
                        >
                            <p>This is a basic modal dialog with a header and content area.</p>
                            <p>You can put any content here.</p>

                            <ModalFooter>
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                            </ModalFooter>
                        </Modal>
                    </div>

                    <div className="demo-item">
                        <h3>Confirmation Modal</h3>
                        <Button variant="danger" onClick={() => setIsConfirmModalOpen(true)}>
                            Delete Item
                        </Button>

                        <Modal
                            isOpen={isConfirmModalOpen}
                            onClose={() => setIsConfirmModalOpen(false)}
                            title="Confirm Deletion"
                            size="sm"
                        >
                            <div className="confirm-modal-content">
                                <div className="confirm-modal-icon">
                                    <AlertCircle size={48} color="#ef4444" />
                                </div>
                                <p>Are you sure you want to delete this item? This action cannot be undone.</p>
                            </div>

                            <ModalFooter>
                                <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                                <Button variant="danger" onClick={() => setIsConfirmModalOpen(false)}>Delete</Button>
                            </ModalFooter>
                        </Modal>
                    </div>
                </div>
            </Section>

            {/* Usage Examples Section */}
            <Section title="Usage Examples">
                <div className="demo-grid">
                    <div className="demo-item demo-item-wide">
                        <h3>Login Form</h3>
                        <div className="demo-form">
                            <TextField
                                label="Email"
                                placeholder="Enter your email"
                                icon={<Mail size={18} />}
                                fullWidth
                            />
                            <TextField
                                type="password"
                                label="Password"
                                placeholder="Enter your password"
                                icon={<Lock size={18} />}
                                fullWidth
                            />
                            <div className="form-actions">
                                <div className="remember-me">
                                    <input type="checkbox" id="remember" />
                                    <label htmlFor="remember">Remember me</label>
                                </div>
                                <Button variant="link">Forgot Password?</Button>
                            </div>
                            <Button fullWidth>Log In</Button>
                        </div>
                    </div>

                    <div className="demo-item demo-item-wide">
                        <h3>Card Component</h3>
                        <div className="demo-card">
                            <div className="card-header">
                                <h4>Project Overview</h4>
                                <Badge variant="primary">Active</Badge>
                            </div>
                            <div className="card-body">
                                <div className="card-stats">
                                    <div className="stat">
                                        <div className="stat-value">85%</div>
                                        <div className="stat-label">Completion</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-value">12</div>
                                        <div className="stat-label">Tasks</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-value">5</div>
                                        <div className="stat-label">Members</div>
                                    </div>
                                </div>
                                <div className="card-info">
                                    <div className="info-item">
                                        <Calendar size={16} />
                                        <span>Due Date: April 15, 2025</span>
                                    </div>
                                    <div className="info-item">
                                        <User size={16} />
                                        <span>Owner: John Doe</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <Button variant="outline" size="sm">View Details</Button>
                                <Button size="sm">Edit Project</Button>
                            </div>
                        </div>
                    </div>

                    <div className="demo-item demo-item-wide">
                        <h3>Alert & Notification Components</h3>
                        <div className="demo-alerts">
                            <div className="alert alert-success">
                                <Check size={20} />
                                <div className="alert-content">
                                    <h4>Success Alert</h4>
                                    <p>Your changes have been saved successfully.</p>
                                </div>
                                <button className="alert-close"><X size={16} /></button>
                            </div>

                            <div className="alert alert-warning">
                                <AlertCircle size={20} />
                                <div className="alert-content">
                                    <h4>Warning Alert</h4>
                                    <p>Your session will expire in 5 minutes.</p>
                                </div>
                                <button className="alert-close"><X size={16} /></button>
                            </div>

                            <div className="alert alert-error">
                                <AlertCircle size={20} />
                                <div className="alert-content">
                                    <h4>Error Alert</h4>
                                    <p>There was a problem processing your request.</p>
                                </div>
                                <button className="alert-close"><X size={16} /></button>
                            </div>

                            <div className="alert alert-info">
                                <Bell size={20} />
                                <div className="alert-content">
                                    <h4>Info Alert</h4>
                                    <p>New updates are available for the system.</p>
                                </div>
                                <button className="alert-close"><X size={16} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="demo-item demo-item-wide">
                        <h3>Data List</h3>
                        <div className="demo-list">
                            <div className="list-header">
                                <h4>Recent Files</h4>
                                <div className="list-actions">
                                    <TextField
                                        placeholder="Search files..."
                                        size="sm"
                                        icon={<Search size={14} />}
                                    />
                                    <Button size="sm" variant="outline">Filter</Button>
                                </div>
                            </div>
                            <div className="list-items">
                                {['Document.pdf', 'Image.jpg', 'Spreadsheet.xlsx', 'Presentation.pptx'].map((file, index) => (
                                    <div key={index} className="list-item">
                                        <div className="list-item-content">
                                            <div className="item-name">{file}</div>
                                            <div className="item-meta">Updated {index + 1} day{index !== 0 ? 's' : ''} ago</div>
                                        </div>
                                        <div className="list-item-actions">
                                            <button className="item-action"><Copy size={16} /></button>
                                            <button className="item-action"><Download size={16} /></button>
                                            <button className="item-action"><X size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="list-footer">
                                <Button variant="link" size="sm">
                                    View All Files
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default ComponentsDemo;